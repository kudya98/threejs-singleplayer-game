import * as THREE from 'three'
import Unit from './Unit'

export default class HitBox extends THREE.Mesh {
    constructor(owner: Unit) {
        const geometry = new THREE.BoxBufferGeometry(owner.size * 2, 20, 5)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        super(geometry, material)
        this.owner = owner
        this.position.y = 200
        owner.model.add(this)
    }
    public update(newHp: number) {
        if (this.owner.hp === newHp) {
            return
        }
        if (this.material instanceof THREE.MeshBasicMaterial) {
            const hpPercent = Math.max(newHp / this.owner.maxHp, 0)
            //this.material.color.set(new THREE.Color(1 - hpPercent, hpPercent, 0))
            this.scale.set(hpPercent, 1, 1)
        }
    }
    private owner: Unit
}
