import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'

export class Panorama {
    private container: HTMLElement // 全景图容器html元素
    private scene: THREE.Scene // 场景
    private camera: THREE.PerspectiveCamera // 相机
    private renderer: THREE.WebGLRenderer // 渲染器
    private controls: OrbitControls // 控制器
    private meshs: Map<string, THREE.Mesh> = new Map()
    private mesh: THREE.Mesh | null = null
    constructor(el: HTMLElement) {
        this.container = el;
        this.scene = new THREE.Scene()
        this.camera = createCamera(el)
        this.renderer = createRenderer(el, this.camera, this.scene)
        this.controls = createControls(this.camera, this.renderer.domElement)
        this.container.appendChild(this.renderer.domElement)
        this.watchContainerResize()
        this.startAutoRotate()
        this.renderer.setAnimationLoop(this.paint)
    }
    private startAutoRotate = () => {
        this.controls.autoRotate = true
        this.container.addEventListener('pointerdown', this.stopAutoRotate)
        this.container.addEventListener('wheel', this.stopAutoRotate, { passive: false })
    }
    private stopAutoRotate = () => {
        this.controls.autoRotate = false
        this.container.removeEventListener('pointerdown', this.stopAutoRotate)
        this.container.removeEventListener('wheel', this.stopAutoRotate)
    }
    private watchContainerResize() {
        window.addEventListener('resize', this.refresh)
    }
    private refresh = () => {
        // 更新相机
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight
        this.camera.updateProjectionMatrix()

        // 更新渲染器
        this.renderer.domElement.width = this.container.clientWidth
        this.renderer.domElement.height = this.container.clientHeight
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    public async useMesh(textureSrc: string): Promise<THREE.Mesh> {
        if (this.meshs.has(textureSrc)) return this.meshs.get(textureSrc) as THREE.Mesh
        const texture = await createTexture(textureSrc)
        const geometry = new THREE.SphereGeometry(500, 100, 60)
        geometry.scale(-1, 1, 1)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        })
        this.mesh = new THREE.Mesh(geometry, material)
        this.meshs.set(textureSrc, this.mesh)
        return this.mesh
    }
    public async setMesh(textureSrc: string) {
        const newMesh = await this.useMesh(textureSrc)
        this.scene.remove(this.mesh as THREE.Mesh)
        this.scene.add(newMesh)
        this.mesh = newMesh
    }
      
    private paint = () => {
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }
    
    public destroy() {
        window.removeEventListener('resize', this.refresh)
        this.stopAutoRotate()
        this.meshs.forEach((mesh)=> { 
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose()
        })
        this.renderer.dispose()
    }
}

function createCamera(container: HTMLElement) {
    const camera = new THREE.PerspectiveCamera(
        70,
        container.clientWidth / container.clientHeight,
        1,
        1000
    )
    camera.position.z = 10
    return camera
}

function createControls(
    camera: THREE.PerspectiveCamera,
    rendererDomElement: HTMLCanvasElement
): OrbitControls {
    const controls = new OrbitControls(camera, rendererDomElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.maxDistance = 1000
    controls.rotateSpeed = -0.25
    return controls
}

function createRenderer(
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene
): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x272727, 1.0);
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
