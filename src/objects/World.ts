import * as THREE from 'three'
import Swat from './Unit/Swat'
import Unit from './Unit/Unit'
import Projectile from './Projectile/Projectile'
import Zombie from './Unit/Zombie'
import ZombieFactory from "./Unit/ZombieFactory";

export const WORLD_SIZE = 10000
export const WORLD_QUADS_SIZE = 500
const SPAWN_INTERVAL = 200

export type WorldObject = Unit | Projectile

interface IWorldObjects {
    units: Unit[]
    projectiles: Projectile[]
}

export interface IKeyMap {
    [s: string]: boolean
}

interface IModel {
    [s: string]: any
}

export default class World {
    private constructor(scene: THREE.Scene, width: number, height: number, models: IModel) {
        World.instance = this
        this.width = width
        this.height = height
        this.models = models
        this.scene = scene
        this.camera = this.prepareCamera()
        this.objects = {
            units: [],
            projectiles: [],
        }
        this.quadtree = []
        this.prepareMap()
        this.spawnPlayer(0, 0)
        this.keyMap = {}
        this.mousePosition = new THREE.Vector2(0, WORLD_SIZE)

        const onkeydown = (e: KeyboardEvent): void => {
            this.keyMap[e.code] = e.type === 'keydown'
        }
        const onkeyup = onkeydown
        const onmousewheel = (e: Event): void => {
            if (e instanceof WheelEvent) {
                const delta = e.deltaY / -2000
                if (this.camera.zoom + delta >= 0.5 && this.camera.zoom + delta <= 2) {
                    this.camera.zoom += delta
                    this.camera.updateProjectionMatrix()
                }
            }
        }
        const onmousemove = (e: MouseEvent) => {
            const mouse = new THREE.Vector2()
            mouse.x = (e.clientX / this.width) * 2 - 1
            mouse.y = -(e.clientY / this.height) * 2 + 1
            if (this.ground) {
                const raycaster = new THREE.Raycaster()
                raycaster.setFromCamera(mouse, this.camera)
                const objAtPoint = raycaster.intersectObjects([this.ground])
                if (objAtPoint.length) {
                    objAtPoint.forEach(obj => {
                        if (obj.object === this.ground) {
                            this.mousePosition.x = obj.point.x
                            this.mousePosition.y = obj.point.z
                        }
                    })
                }
            }
        }
        const onmousedown = (e: MouseEvent) => {
            if (e.button === 0) {
                this.keyMap['ButtonLeft'] = true
            } else if (e.button === 2) {
                this.keyMap['ButtonRight'] = true
            }
        }
        const onmouseup = (e: MouseEvent) => {
            if (e.button === 0) {
                this.keyMap['ButtonLeft'] = false
            } else if (e.button === 2) {
                this.keyMap['ButtonRight'] = false
            }
        }

        const el = document.getElementById('renderer')
        if (el) {
            window.addEventListener('keydown', onkeydown)
            window.addEventListener('keyup', onkeyup)
            window.addEventListener('mousewheel', onmousewheel)
            window.addEventListener('contextmenu', e => e.preventDefault())
            el.addEventListener('mousedown', onmousedown)
            el.addEventListener('mouseup', onmouseup)
            el.addEventListener('mousemove', onmousemove)
        }
    }

    public width: number
    public height: number
    public size = WORLD_SIZE
    public models: IModel
    public static SOUNDS_LEVEL = 0.2
    public static getInstance(options?: any): World {
        if (!World.instance) {
            const {scene, width, height, models} = options
            World.instance = new World(scene, width, height, models);
            // ... any one time initialization goes here ...
        }
        return World.instance;
    }
    public add(obj: WorldObject): void {
        if (obj instanceof Unit) {
            this.objects.units.push(obj)
            this.scene.add(obj.model)
        } else if (obj instanceof Projectile) {
            this.objects.projectiles.push(obj)
            this.scene.add(obj)
        } else {
            this.scene.add(obj)
        }
    }
    public remove(obj: WorldObject) {
        if (obj instanceof Unit) {
            this.dispose(obj.model)
            this.objects.units = this.objects.units.filter(unit => unit !== obj)
            if (obj === this.player) {
                this.spawnPlayer(0, 0)
            }
        } else  {
            this.dispose(obj)
            this.objects.projectiles = this.objects.projectiles.filter(proj => proj !== obj)
        }
    }
    private dispose(obj: THREE.Object3D): void {
        this.scene.remove(obj)
        if (obj instanceof THREE.Mesh) {
            this.scene.remove(obj)
            obj.geometry.dispose()
            Array.isArray(obj.material) ? obj.material.forEach(material => material.dispose()) : obj.material.dispose()
        }
        if (obj.children) {
            obj.children.forEach(child => this.dispose(child))
        }
    }

    public update(delta: number): void {
        if (this.spawnInterval <= 0) {
            this.spawnInterval = SPAWN_INTERVAL
            if (this.player && this.objects.units.length < World.maxUnits) {
                const angle = Math.random() * Math.PI * 2
                const spawnRadius = WORLD_SIZE / 15
                const x = this.player.position.x + (Math.cos(angle) * spawnRadius)
                const y = this.player.position.z + (Math.sin(angle) * spawnRadius)
                ZombieFactory.spawnZombie(x, y)
            }
        } else {
            this.spawnInterval -= delta
        }
        if (this.player) {
            this.camera.position.set(
                -WORLD_SIZE / 2 + this.player.position.x,
                WORLD_SIZE / Math.sqrt(2) + this.player.position.y,
                -WORLD_SIZE / 2 + +this.player.position.z,
            )
        }
        this.updateQuadTree()
        this.objects.units.forEach(unit => {
            unit.update(delta, this.getNearObjects(unit.quadtreeIndex), this.keyMap, this.mousePosition)
        })
        this.objects.projectiles.forEach(projectile => {
            projectile.update(delta, this.getNearObjects(projectile.quadtreeIndex))
        })
    }
    public camera: THREE.OrthographicCamera
    public player?: Unit
    private spawnPlayer(x: number, z: number) {
        this.objects.units.forEach(unit => {
            if (unit instanceof Zombie) {
                this.dispose(unit.model)
                this.remove(unit)
                //unit.updateTarget()
            }
        })
        this.player = undefined
        const model = this.models.swat
        const player = new Swat(model, x, z)
        this.camera.position.set(-WORLD_SIZE / 2, WORLD_SIZE / Math.sqrt(2), -WORLD_SIZE / 2)
        this.camera.lookAt(model.position)
        this.player = player
    }

    private prepareCamera(): THREE.OrthographicCamera {
        const camera = new THREE.OrthographicCamera(
            this.width / -2,
            this.width / 2,
            this.height / 2,
            this.height / -2,
            1,
            WORLD_SIZE * 2,
        )
        camera.position.set(-WORLD_SIZE / 2, WORLD_SIZE / Math.sqrt(2), -WORLD_SIZE / 2)
        camera.zoom = 0.75
        camera.updateProjectionMatrix()
        this.scene.add(camera)
        return camera
    }

    private prepareMap() {
        const light1 = new THREE.PointLight(0xffffff, 1)
        const light2 = new THREE.PointLight(0xffffff, 1)
        const light3 = new THREE.PointLight(0xffffff, 1)
        light1.position.set(-WORLD_SIZE / 2, 0, 0)
        light2.position.set(0, 0, -WORLD_SIZE / 2)
        light3.position.set(0, WORLD_SIZE, 0)
        const lights: THREE.PointLight[] = [light1, light2, light3]
        const background = this.models.background
        const background1 = this.models.background1
        this.scene.add(background, background1, ...lights)
        this.ground = background1
    }

    private getNearObjects(quadtreeIndex?: number): Unit[] {
        if (!quadtreeIndex) {
            return []
        }
        const quads: Unit[] = []
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentIndex =
                    quadtreeIndex - WORLD_SIZE / WORLD_QUADS_SIZE - 1 + j + (i * WORLD_SIZE) / WORLD_QUADS_SIZE
                // eslint-disable-next-line
                if (this.quadtree[currentIndex]?.length) {
                    const aliveUnits = this.quadtree[currentIndex].filter(unit => unit.hp > 0)
                    quads.push(...aliveUnits)
                }
            }
        }
        return quads
    }

    private updateQuadTree() {
        const quadtree: Unit[][] = []
        this.objects.units.forEach(unit => {
            const a = Math.ceil((WORLD_SIZE / 2 - unit.position.z) / WORLD_QUADS_SIZE) - 1
            const b = Math.ceil((WORLD_SIZE / 2 - unit.position.x) / WORLD_QUADS_SIZE) - 1
            const index = (a * WORLD_SIZE) / WORLD_QUADS_SIZE + b
            unit.quadtreeIndex = index
            if (!quadtree[index]) {
                quadtree[index] = [unit]
            } else {
                quadtree[index].push(unit)
            }
        })
        this.objects.projectiles.forEach(proj => {
            const a = Math.ceil((WORLD_SIZE / 2 - proj.position.z) / WORLD_QUADS_SIZE) - 1
            const b = Math.ceil((WORLD_SIZE / 2 - proj.position.x) / WORLD_QUADS_SIZE) - 1
            proj.quadtreeIndex = (a * WORLD_SIZE) / WORLD_QUADS_SIZE + b
        })
        this.quadtree = quadtree
    }

    private spawnInterval = SPAWN_INTERVAL
    private objects: IWorldObjects
    private quadtree: Unit[][]
    private keyMap: IKeyMap
    private mousePosition: THREE.Vector2
    private ground?: THREE.Mesh
    private scene: THREE.Scene
    private static instance?: World
    private static maxUnits = 20
}
