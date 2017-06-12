(() => {

    window.addEventListener('load', () => {

        // 汎用変数の宣言
        let width = window.innerWidth; // ブラウザのクライアント領域の幅
        let height = window.innerHeight; // ブラウザのクライアント領域の高さ
        let targetDOM = document.getElementById('webgl'); // スクリーンとして使う DOM

        // three.js 定義されているオブジェクトに関連した変数を宣言
        let scene; // シーン
        let camera; // カメラ
        let renderer; // レンダラ
        let axis; //ガイド
        let grid; //ガイド
        let directional;
        let ambient;
        let zoomVal = 0;
        let material;
        let geom;
        let points;
        let targetPos = [];
        let speed = [];
        let clientX = 0;
        let clientY = 0;


        // 各種パラメータを設定するために定数オブジェクトを定義
        let CAMERA_PARAMETER = { // カメラに関するパラメータ
            fovy: 90,
            aspect: width / height,
            near: 0.1,
            far: 100.0,
            x: 0.0, // + 右 , - 左
            y: 0, // + 上, - 下
            z: 7.5, // + 手前, - 奥
            lookAt: new THREE.Vector3(0.0, 0.0, 0.0) //x,y,z
        };
        let RENDERER_PARAMETER = { // レンダラに関するパラメータ
            clearColor: 0x000000, //背景のリセットに使う色
            width: width,
            height: height
        };

        let LIGHT_PARAMETER = {
            directional: {
                positionX: -0.5,
                positionY: 4,
                positionZ: 3
            },
            ambient: {
                positionY: 1
            }
        };

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAMETER.fovy,
            CAMERA_PARAMETER.aspect,
            CAMERA_PARAMETER.near,
            CAMERA_PARAMETER.far
        );

        camera.position.x = CAMERA_PARAMETER.x;
        camera.position.y = CAMERA_PARAMETER.y;
        camera.position.z = CAMERA_PARAMETER.z;
        camera.lookAt(CAMERA_PARAMETER.lookAt); //注視点（どこをみてるの？）

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAMETER.clearColor));
        renderer.setSize(RENDERER_PARAMETER.width, RENDERER_PARAMETER.height);
        renderer.shadowMap.enabled = true;

        //renderer.shadowMap.enabled = true; //影を有効
        targetDOM.appendChild(renderer.domElement); //canvasを挿入する

        controls = new THREE.OrbitControls(camera, render.domElement);

        //ライト
        directional = new THREE.DirectionalLight(0xffffff);
        ambient = new THREE.AmbientLight(0xffffff, 0.25);

        directional.castShadow = true;


        directional.position.y = LIGHT_PARAMETER.directional.positionY;
        directional.position.z = LIGHT_PARAMETER.directional.positionZ;
        directional.position.x = LIGHT_PARAMETER.directional.positionX;
        ambient.position.y = LIGHT_PARAMETER.ambient.positionY;

        //directional.castShadow = true;
        directional.shadow.mapSize.width = 800;
        directional.shadow.mapSize.height = 800;
        scene.add(directional);
        scene.add(ambient);

        axis = new THREE.AxisHelper(1000);
        axis.position.set(0, 0, 0);
        //scene.add(axis);

        //グリッドのインスタンス化
        grid = new THREE.GridHelper(100, 50);

        //グリッドオブジェクトをシーンに追加する
        //scene.add(grid);

        createSprites();
        //パーティクルを作成
        function createSprites() {

            geom = new THREE.BufferGeometry();
            let verticesBase = [];
            let colorBase = [];

            for (let i = 0; i < 300000; i++) {
                let rad = Math.PI / 180 * Math.floor(Math.random() * 360);
                let radius = Math.floor(Math.random() * 1)
                let x = Math.cos(rad) * radius;
                let y = Math.sin(rad) * radius;
                let z = -50;
                verticesBase.push(x, y, 0);
                // verticesBase.push(0, 0, 0);
                const h = Math.random() * 1.0;
                const s = 0.2 + Math.random() * 0.8;
                const v = 0.8 + Math.random() * 0.2;
                colorBase.push(h, s, v);

                targetPos.push(Math.floor(Math.random() * width - width / 2));
                targetPos.push(Math.floor(Math.random() * height - height / 2));
                targetPos.push(Math.floor(Math.random() * width - width / 2));

                speed.push(Math.floor(Math.random() * 95 + 5));
                speed.push(Math.floor(Math.random() * 95 + 5));
                speed.push(Math.floor(Math.random() * 95 + 5));
            }

            let vertices = new Float32Array(verticesBase);
            geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));


            let colors = new Float32Array(colorBase);
            geom.addAttribute('color', new THREE.BufferAttribute(colors, 3));

            material = new THREE.ShaderMaterial({
                uniforms: {
                    time: {
                        type: 'f',
                        value: 0.0
                    },
                    size: {
                        type: 'f',
                        value: 3
                    },
                    texture: {
                        type: 't',
                        value: createTexture()
                    }
                },
                vertexShader: document.getElementById('vs').textContent,
                fragmentShader: document.getElementById('fs').textContent,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            points = new THREE.Points(geom, material);
            console.log(points.geometry.attributes.position)
            scene.add(points);


            window.addEventListener('mousemove', function (e) {
                clientX = e.clientX;
                clientY = e.clientY;
            })

        }

        function createTexture() {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            let grad = null;
            let texture = null;

            canvas.width = 5;
            canvas.height = 5;
            grad = ctx.createRadialGradient(2.5, 2.5, 0, 2.5, 2.5, 2.5);
            grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
            grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.2)');
            grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.arc(2.5, 2.5, 2.5, 0, Math.PI / 180, true);
            ctx.fill();

            texture = new THREE.Texture(canvas);
            texture.minFilter = THREE.NearestFilter;
            texture.needsUpdate = true;
            return texture;
        };

        render();

        //描画
        function render() {

            let pos = points.geometry.attributes.position.array;

            for (var i = 0, l = pos.length; i < l; i++) {
                if (i % 3 === 2) {
                    if (Math.abs(pos[i]) > Math.abs(targetPos[i]) - 1) {
                        let rad = Math.PI / 180 * Math.floor(Math.random() * 360);
                        let radius = Math.floor(Math.random() * width)
                        pos[i - 2] = Math.cos(rad) * radius;
                        pos[i - 1] = Math.sin(rad) * radius;
                        pos[i] = -50;
                    } else {
                        pos[i] += (targetPos[i] - pos[i]) / speed[i];
                    }

                } else {
                    pos[i] += (targetPos[i] - pos[i]) / speed[i];
                }

            }

            points.geometry.attributes.position.needsUpdate = true;

            //material.uniforms.time.value += 0.1;
            //camera.rotation.z += 0.1;
            // camera.rotation.y += 0.005;
            //camera.rotation.x += 0.005;
            // rendering
            renderer.render(scene, camera);

            // animation
            requestAnimationFrame(render);
        }

    }, false);
})();