import React, { useState, useRef, useEffect, ReactElement } from 'react'
import * as THREE from 'three'
import World from '../objects/World'
import { modelLoader } from '../helpers/modelLoader'

function Renderer({ setState }: any): ReactElement {
    const [models, setModels]: any = useState({
        isLoaded: false,
    })
    const ref = useRef<HTMLDivElement>(null)
    const handleWindowResize = (renderer: THREE.Renderer): void => {
        if (ref.current) {
            const world = World.getInstance()
            const width = ref.current.clientWidth
            const height = ref.current.clientHeight
            const { camera } = world

            world.width = width
            world.height = height
            renderer.setSize(width, height)
            camera.left = width / -2
            camera.right = width / 2
            camera.top = height / 2
            camera.bottom = height / -2
            camera.updateProjectionMatrix()
        }
    }

    useEffect(() => {
        modelLoader(setModels)
    }, [])

    useEffect(() => {
        if (ref.current && models.isLoaded) {
            const { current } = ref
            const width = current.clientWidth
            const height = current.clientHeight
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
            })
            renderer.setSize(width, height)
            const scene = new THREE.Scene()
            scene.background = new THREE.Color('white')
            const world = World.getInstance({ scene, width, height, models })
            current.appendChild(renderer.domElement)
            const render = (delta: number): void => {
                const { player } = world
                const timestamp = performance.now()
                if (document.hasFocus()) {
                    world.update(delta)
                    setState({ player })
                }
                window.requestAnimationFrame(() => render(performance.now() - timestamp))
                renderer.render(scene, world.camera)
            }
            render(0)
            window.addEventListener('resize', () => handleWindowResize(renderer))
        }
    }, [models])

    return models.isLoaded ? <div id="renderer" className="renderer" ref={ref} /> : <div>Loading...</div>
}

export default Renderer
