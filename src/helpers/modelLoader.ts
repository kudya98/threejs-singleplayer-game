import * as THREE from 'three'
import { WORLD_SIZE, WORLD_QUADS_SIZE } from '../objects/World'
import Swat from '../objects/Unit/Swat'
import Zombie from '../objects/Unit/Zombie'

export function modelLoader(setModels: any) {
    const background = new THREE.GridHelper(WORLD_SIZE, WORLD_SIZE / WORLD_QUADS_SIZE, 0x000000, 0x222222)
    background.position.y = -5
    const background1 = new THREE.Mesh(
        new THREE.BoxBufferGeometry(WORLD_SIZE, 1, WORLD_SIZE),
        new THREE.MeshBasicMaterial({
            color: 'grey',
        }),
    )
    background1.position.y = -10
    Swat.loadModel((swat: THREE.Group) => {
        Zombie.loadModel((zombie: THREE.Group) => {
            setModels({ background, background1, swat, zombie, isLoaded: true })
        })
    })
}
