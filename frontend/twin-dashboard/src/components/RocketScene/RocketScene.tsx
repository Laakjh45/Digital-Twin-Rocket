import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { EdgesGeometry, LineSegments, LineBasicMaterial} from "three";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

// ROCKET MODEL COMPONENT
const RocketModel = forwardRef(({onSensorClick, selectedSensor, latestData, allSensorData, mode}: any, ref) => {
  const gltf = useGLTF("/models/PSLV_DigitalTwin_v2.glb");
  const pulseRef = useRef(0);
  const shockwaves = useRef<any[]>([]);
  const glowMeshes = useRef<any[]>([]);
  const sensorMeshes = useRef<any[]>([]);
  const applyToMaterial = (material: any, fn: (mat: any) => void) => {
    if (Array.isArray(material)) {
      material.forEach((m) => m && fn(m));
    } else if (material) {
      fn(material);
    }
  };

  //  CLICK HANDLER
  const handleClick = (e: any) => {
    e.stopPropagation();
    let obj = e.object;
    while (obj) {
      if (obj.name && obj.name.startsWith("SENSOR")) {
        console.log("Clicked sensor:", obj.name);
        onSensorClick(obj.name);
        return;
      }
      obj = obj.parent;
    }
  };

  // FIND SENSOR
  const findParentSensor = (obj: any) => {
    let current = obj;
    while (current) {
      if (current.name && current.name.startsWith("SENSOR")) {
        return current.name;
      }
      current = current.parent;
    }
    return null;
  };

  const sensorCache = useMemo(() => {
    const map: any = {};
    for (const key in allSensorData) {
      const obj = allSensorData[key];
      if (!obj) continue;
      const firstKey = Object.keys(obj)[0];
      map[key] = obj[firstKey];
    }
    return map;
  }, [allSensorData]);

  useEffect(() => {
    sensorMeshes.current = [];
    gltf.scene.traverse((child: any) => {
      if (!child.isMesh) return;
      // ALWAYS CLEAN OLD EDGES (important fix)
      child.children.forEach((c: any) => {
        if (c.userData?.isEdge) child.remove(c);
      });
      // Clone material ONCE
      if (!child.userData.cloned) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m: any) => m.clone());
        } else if (child.material) {
          child.material = child.material.clone();
        }
        child.userData.cloned = true;
      }
      // Cache sensor relationship
      const parentSensor = findParentSensor(child);
      child.userData.sensorName = parentSensor;
      // Store only sensor-related meshes (BIG optimization later)
      if (parentSensor) {
        sensorMeshes.current.push(child);
      }
      // Cache edges geometry (we’ll use later)
      if (child.geometry && !child.userData.edges) {
        child.userData.edges = new EdgesGeometry(child.geometry);
      }
    });
  }, []);

  // MAIN RENDER LOGIC
  useEffect(() => {
    glowMeshes.current = [];
    gltf.scene.traverse((child: any) => {
      if (!child.isMesh) return;
      const parentSensor = child.userData.sensorName;
      // ALWAYS REMOVE OLD EDGES (KEY FIX)
      child.children.forEach((c: any) => {
        if (c.userData?.isEdge) child.remove(c);
      });
      // NON-SENSOR PARTS
      if (!parentSensor) {
        applyToMaterial(child.material, (mat) => {
          if (mode === "sensor") {
            mat.opacity = 0.15;
            mat.transparent = true;
          } 
          else if (mode === "heatmap") {
            mat.opacity = 0.1;
            mat.transparent = true;
          } 
          else if (mode === "wireframe") {
            mat.opacity = 0.05;
            mat.transparent = true;
          } 
          else {
            mat.opacity = 1;
            mat.transparent = false;
          }
        });
      }
      // ADD EDGES ONLY IF WIREFRAME
      if (mode === "wireframe" && child.userData.edges) {
        const line = new LineSegments(
          child.userData.edges,
          new LineBasicMaterial({ color: "#00ffff" })
        );
        line.userData.isEdge = true;
        child.add(line);
      }
    });
    sensorMeshes.current.forEach((child: any) => {
      if (child.userData.lastMode !== mode) {
        // reset ONLY when mode changes
        applyToMaterial(child.material, (mat) => {
          mat.wireframe = false;
          mat.opacity = 1;
          mat.transparent = false;

          if (mat.emissive) {
            mat.emissive.set("#000000");
            mat.emissiveIntensity = 0;
          }
        });
        child.userData.lastMode = mode;
      }
      // Match body opacity in wireframe mode
      if (mode === "wireframe") {
        applyToMaterial(child.material, (mat) => {
          mat.opacity = 0.05;
          mat.transparent = true;
        });
      }
      if (child.isMesh && child.name?.startsWith("GLOW")) {
        glowMeshes.current.push(child);
      }
      if (!child.isMesh) return;
      const parentSensor = child.userData.sensorName;
      child.userData.getValue = () => {
        return sensorCache[parentSensor] ?? null;
      };

      /* ---------------- MATERIAL MODE ---------------- */
      if (mode === "material") {
        if (child.name?.startsWith("GLOW")) {
          const parentSensor = child.userData.sensorName;
          const value = sensorCache[parentSensor] ?? null;
          let emissive = "#000000";
          let intensity = 0;
          if (value !== null) {
            if (value > 80) {
              emissive = "#ff0000";
              intensity = 2;
            } else if (value > 50) {
              emissive = "#ffaa00";
              intensity = 1.5;
            } else {
              emissive = "#00ff00";
              intensity = 1.5;
            }
          }
          const color = new THREE.Color(emissive);
          color.offsetHSL(0, 0, 0.05);
          applyToMaterial(child.material, (mat) => {
            if (mat.emissive) {
              mat.emissive.set(color);
              mat.emissiveIntensity = intensity;
            }
          });
        }
        return;
      }

      if (mode === "heatmap") {
        const value = sensorCache[parentSensor] ?? null;
        if (value !== null && parentSensor) {
          let min = 0;
          let max = 100;

          // detect metric type from sensor data
          const sensor = allSensorData[parentSensor];
          const key = sensor ? Object.keys(sensor)[0] : "";

          if (key.includes("temperature")) {
            min = 20;
            max = 120;
          } else if (key.includes("pressure")) {
            min = 1;
            max = 10;
          } else if (key.includes("vibration")) {
            min = 0;
            max = 10;
          } else if (key.includes("acceleration")) {
            min = 0;
            max = 50;
          } else if (key.includes("voltage")) {
            min = 20;
            max = 30;
          } else if (key.includes("strain")) {
            min = 0;
            max = 5;
          } else if (key.includes("health")) {
            min = 0;
            max = 100;
          }
          const t = Math.min(Math.max((value - min) / (max - min), 0), 1);
          const color = new THREE.Color().setHSL((1 - t) * 0.3, 1, 0.5);
          applyToMaterial(child.material, (mat) => {
            if (mat.emissive) {
              mat.emissive.set(color);
              mat.emissiveIntensity = 2;
            }
          });
        }

        // dim non-sensor parts
        if (!parentSensor) {
          applyToMaterial(child.material, (mat) => {
            mat.opacity = 0.1;
            mat.transparent = true;
          });
        }
        return;
      }

      /* ---------------- SENSOR MODE ---------------- */
      if (mode === "sensor") {
        if (child.name?.startsWith("GLOW")) {
          const value = sensorCache[parentSensor] ?? null;
          let color = "#222222";
          let emissive = "#000000";
          let intensity = 0;

          if (value !== null) {
            if (value > 80) {
              color = "#ff0000";
              emissive = "#ff0000";
              intensity = 3;
            } else if (value > 50) {
              color = "#ffaa00";
              emissive = "#ffaa00";
              intensity = 2;
            } else {
              color = "#00ff00";
              emissive = "#00ff00";
              intensity = 2;
            }
          }

          // SELECTED SENSOR BOOST
          let finalIntensity = intensity;
          if (parentSensor === selectedSensor) {
            finalIntensity = 5;
          }
          applyToMaterial(child.material, (mat) => {
            if (mat.emissive) {
              mat.emissive.set(emissive);
              mat.emissiveIntensity = finalIntensity;
            }
          });
        }

        // DIM NON-SENSOR PARTS
        if (!parentSensor) {
          applyToMaterial(child.material, (mat) => {
            mat.opacity = 0.15;
            mat.transparent = true;
          });
        }
      }
    });
  }, [mode, selectedSensor, latestData, allSensorData]);

  useFrame(() => {
    glowMeshes.current.forEach((child: any) => {
      const parentSensor = child.userData.sensorName;
      const rawValue = child.userData.getValue();
      // HANDLE NULL PROPERLY
      if (rawValue === null) {
        child.userData.smoothed = null;
      } else {
        if (child.userData.smoothed === undefined || child.userData.smoothed === null) {
          child.userData.smoothed = rawValue;
        } else {
          child.userData.smoothed = THREE.MathUtils.lerp(
            child.userData.smoothed,
            rawValue,
            0.1
          );
        }
      }
      const value = child.userData.smoothed;
      
      if (mode !== "sensor") return;
      if (value === null) return;
      let emissive = "#000000";
      let baseIntensity = 0;
      let speed = 0.05;
      let amplitude = 0;

      if (value > 80) {
        emissive = "#ff0000";
        baseIntensity = 2.5;
        speed = 0.18;
        amplitude = 3.5;
      } else if (value > 50) {
        emissive = "#ffaa00";
        baseIntensity = 1.8;
        speed = 0.1;
        amplitude = 1.8;
      } else {
        emissive = "#00ff00";
        baseIntensity = 1.2;
        speed = 0.05;
        amplitude = 0.3; // subtle breathing instead of dead static
      }

      // TIME UPDATE (with variation per mesh)
      if (!child.userData.pulseTime) {
        child.userData.pulseTime = Math.random() * 10; // unique start
      }

      child.userData.pulseTime += speed;

      const t =
        (Math.sin(child.userData.pulseTime + child.id) + 1) / 2;

      //  SMOOTH EASING (premium feel)
      const eased = t * t * (3 - 2 * t);
      //  MICRO NOISE (organic feel)
      const noise = Math.sin(child.userData.pulseTime * 0.5 + child.id * 10) * 0.15;
      const pulse = eased + noise;
      // SHOCKWAVE TRIGGER (only critical sensors)
      if (value > 85 && (!child.userData.lastShock || Date.now() - child.userData.lastShock > 800)) {
        child.userData.lastShock = Date.now();
        const shockwave = {
          mesh: new THREE.Mesh(
            new THREE.RingGeometry(0.1, 0.2, 64),
            new THREE.MeshBasicMaterial({
              color: emissive,
              transparent: true,
              opacity: 0.8,
              side: THREE.DoubleSide,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            })
          ),
          scale: 1,
          life: 1,
        };

        // position at sensor
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        shockwave.mesh.position.copy(pos);

        // GET SURFACE NORMAL (sensor facing direction)
        const normal = new THREE.Vector3(0, 1, 0); // default forward

        normal.applyQuaternion(
          child.getWorldQuaternion(new THREE.Quaternion())
        );

        // ALIGN RING TO THAT NORMAL
        shockwave.mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1), // ring default normal
          normal.normalize()
        );
      
        gltf.scene.add(shockwave.mesh);
        shockwaves.current.push(shockwave);
      }

      let finalIntensity = baseIntensity + pulse * amplitude;

      //  SELECTED SENSOR BOOST
      if (parentSensor === selectedSensor) {
        finalIntensity += 2.5;
      }
      const color = new THREE.Color(emissive);
      // dynamic glow variation (THIS is the premium feel)
      color.offsetHSL(0, 0, pulse * 0.08);

      applyToMaterial(child.material, (mat) => {
        if (mat.emissive) {
          mat.emissive.set(color);
          mat.emissiveIntensity = finalIntensity;
        }
      });
    });
    // ANIMATE SHOCKWAVES
    shockwaves.current = shockwaves.current.filter((sw) => {
      sw.scale += 0.08;
      sw.life -= 0.015;
      sw.mesh.scale.set(sw.scale, sw.scale, sw.scale);
      sw.mesh.material.opacity = sw.life;
      // subtle fade
      sw.mesh.material.color.offsetHSL(0, 0, -0.01);
      if (sw.life <= 0) {
        gltf.scene.remove(sw.mesh);
        return false;
      }
      return true;
    });
  });

  return (
    <primitive ref={ref} object={gltf.scene} scale={1} onClick={handleClick} />
  );
});

//  MAIN SCENE
const RocketScene = forwardRef(({onSensorClick, selectedSensor, latestData, allSensorData, mode, isFocusMode, setIsFocusMode, setIsResetActive}: any, ref:any) => {
  const controlsRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const previousViewRef = useRef<{position: THREE.Vector3; target: THREE.Vector3;} | null>(null);
  const hasUserMovedRef = useRef(false);
  const initialFocusRef = useRef<{ position: THREE.Vector3; target: THREE.Vector3;} | null>(null);
  const focusModeRef = useRef(false);

  useEffect(() => {
    focusModeRef.current = isFocusMode;
  }, [isFocusMode]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onMove = () => {
      if (focusModeRef.current) {
        hasUserMovedRef.current = true;
      }
    };
    controls.addEventListener("change", onMove);
    return () => {
      controls.removeEventListener("change", onMove);
    };
  }, [isFocusMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!modelRef.current || !controlsRef.current) return;
      const box = new THREE.Box3().setFromObject(modelRef.current);
      if (!box.isEmpty()) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        const controls = controlsRef.current;
        const cam = controls.object;
        const offset = new THREE.Vector3(5, 3, 20);
        cam.position.copy(center.clone().add(offset));
        controls.target.copy(center);
        controls.update();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const initialOffset = new THREE.Vector3(5, 3, 20);
    const check = () => {
      const cam = controls.object;
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const expected = center.clone().add(initialOffset);
      const dist = cam.position.distanceTo(expected);

      setIsResetActive(dist > 0.01);
    };

    controls.addEventListener("change", check);

    return () => {
      controls.removeEventListener("change", check);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const dir = new THREE.Vector3();
      dir.subVectors(controls.object.position, controls.target).normalize();
      controls.object.position.addScaledVector(dir, -0.5);
      controls.update();
    },
    zoomOut: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const dir = new THREE.Vector3();
      dir.subVectors(controls.object.position, controls.target).normalize();
      controls.object.position.addScaledVector(dir, 0.5);
      controls.update();
    },
    resetView: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const cam = controls.object;
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      cam.position.copy(center.clone().add(new THREE.Vector3(5, 3, 20)));
      controls.target.copy(center);
      controls.update();
      setIsFocusMode(false);
      focusModeRef.current = false;
      setIsResetActive(false);
    },

    moveLeft: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const camera = controls.object;
      // rotate camera around Y axis
      const offset = new THREE.Vector3();
      offset.copy(camera.position).sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.2);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    },

    moveRight: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const camera = controls.object;
      const offset = new THREE.Vector3();
      offset.copy(camera.position).sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.2);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    },

    moveUp: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const offset = new THREE.Vector3(0, 0.5, 0);
      controls.object.position.add(offset);
      controls.target.add(offset);
      controls.update();
    },

    moveDown: () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const offset = new THREE.Vector3(0, -0.5, 0);
      controls.object.position.add(offset);
      controls.target.add(offset);
      controls.update();
    },

    exitFocus: () => {
      const controls = controlsRef.current;
      if (!controls || !previousViewRef.current) return;
      const cam = controls.object;
      const { position, target } = previousViewRef.current;
      cam.position.copy(position);
      controls.target.copy(target);
      controls.update();
      setIsFocusMode(false);
      focusModeRef.current = false;
    },

    focusOnSensor: (sensorName: string, options?: { fromSensorClick?: boolean }) => {
      // Already in focus mode
      const fromSensorClick = options?.fromSensorClick;

      // If already in focus mode
      if (focusModeRef.current) {
        // ONLY allow exit when NOT sensor click
        if (!fromSensorClick && !hasUserMovedRef.current) {
          const controls = controlsRef.current;
          const cam = controls.object;

          const { position, target } = previousViewRef.current || {};
          if (position && target) {
            cam.position.copy(position);
            controls.target.copy(target);
            controls.update();
          }
          setIsFocusMode(false);
          focusModeRef.current = false;
          return;
        }

        // Otherwise ALWAYS refocus
        hasUserMovedRef.current = false;
      }
      if (!modelRef.current) return;
      const controls = controlsRef.current;
      const cam = controls.object;
      // save previous view ONLY first time
      if (!focusModeRef.current) {
        previousViewRef.current = {
          position: cam.position.clone(),
          target: controls.target.clone(),
        };
        setIsFocusMode(true);
        focusModeRef.current = true;
        hasUserMovedRef.current = false;
      }

      let targetObj: any = null;
      modelRef.current.traverse((child: any) => {
        if (child.name === sensorName) targetObj = child;
      });
      if (!targetObj) return;
      const pos = new THREE.Vector3();
      targetObj.getWorldPosition(pos);
      const normal = new THREE.Vector3(1, 0, 0);
      normal.applyQuaternion(
        targetObj.getWorldQuaternion(new THREE.Quaternion())
      );
      const newPos = pos.clone().add(normal.multiplyScalar(1));
      initialFocusRef.current = {
        position: newPos.clone(),
        target: pos.clone(),
      };
      const startPos = cam.position.clone();
      const startTarget = controls.target.clone();
      let t = 0;
      const ease = (t: number) => t * t * (3 - 2 * t);
      const animate = () => {
        t += 0.05;
        const k = ease(t);
        cam.position.lerpVectors(startPos, newPos, k);
        controls.target.lerpVectors(startTarget, pos, k);
        controls.update();
        if (t < 1) requestAnimationFrame(animate);
      };
      animate();
    },
    isFocusMode,
  }));

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [5, 5, 10], fov: 50 }}>
        {/* LIGHTING */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        {/* MODEL */}
        <Suspense fallback={null}>
          <RocketModel
            onSensorClick={onSensorClick}
            selectedSensor={selectedSensor}
            latestData={latestData}
            allSensorData={allSensorData}
            mode={mode}
            ref={modelRef}
          />
        </Suspense>
        <EffectComposer>
          <Bloom
            intensity={
              mode === "sensor" || mode === "heatmap"
                ? 1.8
                : 0.4
            }
            luminanceThreshold={
              mode === "sensor" || mode === "heatmap"
                ? 0.15
                : 0.6
            }
            luminanceSmoothing={0.4}
          />
        </EffectComposer>
        {/* CONTROLS */}
        <OrbitControls ref={controlsRef} enableDamping={false} screenSpacePanning={false} enablePan={true}  />
      </Canvas>
      {/* FLOATING MOVE CONTROLS */}
      <div style={moveStyles.container}>
        <button style={{
            ...moveStyles.btn,
            ...(hovered === "up" && moveStyles.btnHover)
          }}
          onMouseEnter={() => setHovered("up")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => ref?.current?.moveUp()}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        >
          <ArrowUp size={14} />
        </button>

        <button
          style={{
            ...moveStyles.btn,
            ...(hovered === "down" && moveStyles.btnHover)
          }}
          onMouseEnter={() => setHovered("down")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => ref?.current?.moveDown()}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        >
          <ArrowDown size={14} />
        </button>

        <button
          style={{
            ...moveStyles.btn,
            ...(hovered === "left" && moveStyles.btnHover)
          }}
          onMouseEnter={() => setHovered("left")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => ref?.current?.moveLeft()}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        >
          <ArrowLeft size={14} />
        </button>

        <button
          style={{
            ...moveStyles.btn,
            ...(hovered === "right" && moveStyles.btnHover)
          }}
          onMouseEnter={() => setHovered("right")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => ref?.current?.moveRight()}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
});
export default RocketScene;


const moveStyles: {container: CSSProperties; btn: CSSProperties; btnHover: CSSProperties;} = {
  container: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    zIndex: 10,
  },

  btn: {
    width: "32px",
    height: "32px",
    padding: 0,
    borderRadius: "6px",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid #334155",
    color: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  btnHover: {
    transform: "scale(1.1)",
    background: "rgba(30,41,59,0.9)",
    border: "1px solid #38bdf8",
    boxShadow: "0 0 10px rgba(56,189,248,0.6)",
  },
};