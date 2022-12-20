import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'

const fov = 40 // 相机视角
const near = 1 // 近平面
const far = 2000 // 远平面
const minZ = 1 // 最小的Z观察坐标
const entryAnimationSpeed = 25 // 进入动画速度
const bg = 0x808080 // 背景色
const frames = 1000 / 60 // 帧率

export class Panorama {
    private container: HTMLElement // 全景图容器html元素
    private scene: THREE.Scene // 场景
    private camera: THREE.PerspectiveCamera // 相机
    private renderer: THREE.WebGLRenderer // 渲染器
    private controls: OrbitControls // 控制器
    private meshs: Map<string | number, THREE.Mesh> = new Map()
    private mesh: THREE.Mesh | null = null
    private animates: Set<any> = new Set() // 动画集合
    constructor(el: HTMLElement) {
        this.container = el
        this.scene = new THREE.Scene()
        this.camera = createCamera(el)
        this.renderer = createRenderer(el, this.camera, this.scene)
        this.controls = createControls(this.camera, this.renderer.domElement)
        this.container.appendChild(this.renderer.domElement)
        this.watchContainerResize()
        this.startAutoRotate()
        this.entryAnimation()
        this.renderer.setAnimationLoop(this.paint)
    }
    public startAutoRotate = () => {
        this.controls.autoRotate = true
        this.container.addEventListener('pointerdown', this.stopAutoRotate)
        this.container.addEventListener('wheel', this.stopAutoRotate, {
            passive: false,
        })
    }
    public stopAutoRotate = () => {
        this.controls.autoRotate = false
        this.container.removeEventListener('pointerdown', this.stopAutoRotate)
        this.container.removeEventListener('wheel', this.stopAutoRotate)
    }
    private watchContainerResize() {
        window.addEventListener('resize', this.refresh)
    }
    private refresh = () => {
        // 更新相机
        this.camera.aspect =
            this.container.clientWidth / this.container.clientHeight
        this.camera.updateProjectionMatrix()

        // 更新渲染器
        this.renderer.domElement.width = this.container.clientWidth
        this.renderer.domElement.height = this.container.clientHeight
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        )
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    public async useMesh(panoramaImage: PanoramaImage): Promise<THREE.Mesh> {
        if (this.meshs.has(panoramaImage.id))
            return this.meshs.get(panoramaImage.id) as THREE.Mesh
        const mesh = await createMesh(panoramaImage.src, panoramaImage.type)
        this.meshs.set(panoramaImage.id, mesh)
        return mesh
    }
    public async setMesh(panoramaImage: PanoramaImage, loading = true) {
        const newMesh = await this.useMesh(panoramaImage)
        if (newMesh === this.mesh) return
        if (loading) await this.fade('out')
        this.scene.remove(this.mesh as THREE.Mesh)
        this.scene.add(newMesh)
        if (loading) await this.fade('in')
        this.mesh = newMesh
    }
    private fade(type: 'in' | 'out', speed = 4): Promise<string> {
        const max = 1
        const min = 0.2
        return new Promise((resolve) => {
            const fadeIn = () => {
                const increment =
                    parseFloat(this.container.style.opacity) + speed / 100
                if (increment > max)
                    return resolve((this.container.style.opacity = '1'))
                this.container.style.opacity = (
                    parseFloat(this.container.style.opacity) +
                    speed / 100
                ).toString()
                setTimeout(fadeIn, frames)
            }
            const fadeOut = () => {
                const discrement =
                    parseFloat(this.container.style.opacity) - speed / 100
                if (discrement < min)
                    return resolve((this.container.style.opacity = '0'))
                this.container.style.opacity = (
                    parseFloat(this.container.style.opacity) -
                    speed / 100
                ).toString()
                setTimeout(fadeIn, frames)
            }
            if (type === 'in') {
                this.container.style.opacity = min.toString()
                fadeIn()
            } else {
                this.container.style.opacity = max.toString()
                fadeOut()
            }
        })
    }

    private paint = () => {
        for (const animate of this.animates) {
            animate()
        }
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }

    public destroy() {
        window.removeEventListener('resize', this.refresh)
        this.stopAutoRotate()
        this.meshs.forEach((mesh) => {
            mesh.geometry.dispose()
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((material: THREE.Material) =>
                    material.dispose()
                )
                return
            }
            (mesh.material as THREE.Material).dispose()
        })
        this.renderer.dispose()
    }

    private entryAnimation() {
        this.camera.position.z = far
        const animation = () => {
            if (this.camera.position.z - entryAnimationSpeed < minZ) {
                this.camera.position.z = minZ
                this.controls.maxDistance = far / 4.5
                this.animates.delete(animation)
                return
            }
            this.camera.position.z -= entryAnimationSpeed
        }

        setTimeout(() => this.animates.add(animation), 2000)
    }
}

async function createMesh(src: string, type = 'equirectangular') {
    let geometry: THREE.BoxGeometry | THREE.SphereGeometry
    let materials: THREE.Material | THREE.Material[]
    if (type === 'equirectangular') {
        geometry = new THREE.SphereGeometry(far / 4, 60, 40)
        const texture = await createTexture(src)
        materials = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
        })
    } else {
        geometry = new THREE.BoxGeometry(far / 2, far / 2, far / 2)
        const textures = await getTexturesFromAtlasFile(src, 6)
        materials = textures.map(
            (texture) =>
                new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                })
        )
    }
    geometry.scale(-1, 1, 1)

    const mesh: THREE.Mesh = new THREE.Mesh(geometry, materials)
    return mesh
}

function getTexturesFromAtlasFile(imgUrl: string, tilesNum: number) {
    const textures: THREE.Texture[] = []

    for (let i = 0; i < tilesNum; i++) {
        textures[i] = new THREE.Texture()
    }
    return new Promise<THREE.Texture[]>((resolve, reject) => {
        new THREE.ImageLoader().load(
            imgUrl,
            (image) => {
                let canvas: HTMLCanvasElement, context: CanvasRenderingContext2D
                const tileWidth = image.height

                for (let i = 0; i < textures.length; i++) {
                    canvas = document.createElement('canvas')
                    context = canvas.getContext(
                        '2d'
                    ) as CanvasRenderingContext2D
                    canvas.height = tileWidth
                    canvas.width = tileWidth
                    context.drawImage(
                        image,
                        tileWidth * i,
                        0,
                        tileWidth,
                        tileWidth,
                        0,
                        0,
                        tileWidth,
                        tileWidth
                    )
                    textures[i].image = canvas
                    textures[i].needsUpdate = true
                }
                resolve(textures)
            },
            reject
        )
    })
}

function createCamera(container: HTMLElement) {
    const camera = new THREE.PerspectiveCamera(
        fov,
        container.clientWidth / container.clientHeight,
        near,
        far
    )
    return camera
}

function createControls(
    camera: THREE.PerspectiveCamera,
    rendererDomElement: HTMLCanvasElement
): OrbitControls {
    const controls = new OrbitControls(camera, rendererDomElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.maxDistance = far
    controls.autoRotateSpeed = 0.6
    return controls
}

function createRenderer(
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene
): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(bg, 1.0)
    renderer.render(scene, camera)
    return renderer
}

async function createTexture(src: string) {
    const textureLoader = new THREE.TextureLoader()
    return new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(src, resolve, undefined, reject)
    })
}

export async function createPanorama(el: HTMLElement): Promise<Panorama> {
    return new Panorama(el)
}
