import * as THREE from 'three'
import Unit from './Unit'

const SIZE = 3000

export default class AimTracer extends THREE.Mesh {
    constructor(owner: Unit) {
        const geometry = new THREE.CylinderBufferGeometry(1, 1, 3000)
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
        super(geometry, material)
        this.owner = owner
        owner.model.add(this)
        this.rotateX(Math.PI / 2)
        //зависит от моделек
        this.position.x = owner.position.x - 10
        this.position.y = owner.position.y + 150
        this.position.z = this.owner.position.z + SIZE / 2
    }
    public update(toShow: boolean) {
        this.visible = toShow
    }
    private owner: Unit
}
