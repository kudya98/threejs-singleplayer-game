import * as THREE from 'three'
import Projectile, { IOptions } from './Projectile'
import World from '../World'
import Unit from '../Unit/Unit'

const options = {
    damage: 200,
}

export default class RifleBullet extends Projectile {
    constructor(owner: Unit, direction: THREE.Vector2, options: IOptions) {
        const world = World.getInstance()
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const vertexShader = document.getElementById('vertexShader').textContent || undefined
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const fragmentShader = document.getElementById('fragmentShader').textContent || undefined
        const geometry = new THREE.CylinderBufferGeometry(5, 5, 100)
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
        })
        super(geometry, material, owner, direction, options)
        const glowGeometry = new THREE.CylinderBufferGeometry(7, 7, 125)
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                c: { type: 'f', value: 1 },
                p: { type: 'f', value: 1.2 },
                glowColor: { type: 'c', value: new THREE.Color(0x0000ff) },
                viewVector: { type: 'v3', value: world.camera.position },
            },
            vertexShader,
            fragmentShader,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
        })
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        this.add(glow)
    }
    public update(delta: number, nearObjects: Unit[]) {
        if (this.destroyTimeout <= 0) {
            this.world.remove(this)
            return
        }
        this.destroyTimeout -= delta
        const newX = this.position.x + this.dX * (delta / 1000)
        const newZ = this.position.z + this.dZ * (delta / 1000)
        const collisions = this.detectCollisions(nearObjects, newX, newZ)
        this.handleCollisions(collisions)
        this.position.x = newX
        this.position.z = newZ
    }
    protected handleCollisions(collisions: Unit[]): void {
        if (collisions.length) {
            collisions.forEach(unit => {
                unit.hp -= options.damage
                unit.position.x += this.dX * 0.001
                unit.position.z += this.dZ * 0.001
                const animation = unit.animations.list.find(animation => animation.name === 'hit')
                if (animation) {
                    animation.reset()
                    animation.play()
                }
            })
            this.world.remove(this)
        }
    }
}
