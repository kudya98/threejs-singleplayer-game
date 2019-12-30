import * as THREE from 'three'
import Unit from './Unit'

type Animation = THREE.AnimationAction & {
    priority: number
    name: string
    isActive: (unit: Unit) => boolean
}

export default class Animations {
    constructor(unit: Unit) {
        this.mixer = new THREE.AnimationMixer(unit.model)
        this.clips = unit.model.animations
        this.list = []
        this.current = []
        this.clips.forEach(clip => {
            const action = this.mixer.clipAction(clip)
            let priority = 0
            let isActive = (unit: Unit) => false
            switch (clip.name) {
                case 'idle': {
                    priority = 1
                    isActive = (unit: Unit) => unit.dX === 0 && unit.dZ === 0
                    break
                }
                case 'walkbackward': {
                    priority = 3
                    isActive = (unit: Unit) => {
                        return (unit.dX !== 0 || unit.dZ !== 0) && unit.dX ** 2 + unit.dZ ** 2 < unit.speed ** 2 - 10
                    }
                    break
                }
                case 'walkforward': {
                    priority = 3
                    isActive = (unit: Unit) => {
                        return unit.dX ** 2 + unit.dZ ** 2 >= unit.speed ** 2 - 10
                    }
                    break
                }
                case 'shoot': {
                    action.setLoop(THREE.LoopOnce, 1)
                    action.clampWhenFinished = true
                    priority = 2
                    isActive = (unit: Unit) => {
                        // eslint-disable-next-line
                        return (unit.currentAction?.name === 'shoot')
                    }
                    break
                }
                case 'run': {
                    priority = 4
                    isActive = (unit: Unit) => {
                        // eslint-disable-next-line
                        return (unit.currentAction?.name === 'run')
                    }
                    break
                }
                case 'hit': {
                    action.setLoop(THREE.LoopOnce, 1)
                    action.timeScale = 3
                    priority = 5
                    isActive = () => false
                    break
                }
                case 'attack': {
                    action.setLoop(THREE.LoopOnce, 1)
                    priority = 5
                    isActive = (unit: Unit) => {
                        // eslint-disable-next-line
                        return (unit.currentAction?.name === 'attack')
                    }
                    break
                }
                case 'dying': {
                    action.setLoop(THREE.LoopOnce, 1)
                    action.clampWhenFinished = true
                    priority = 6
                    isActive = (unit: Unit) => {
                        return unit.hp <= 0
                    }
                    break
                }
                default: {
                    return
                }
            }
            this.list.push(
                Object.assign(action, {
                    priority,
                    name: clip.name,
                    isActive,
                }),
            )
        })
    }
    public play(unit: Unit) {
        const sortedAnimations = this.list.sort((a, b) => {
            if (b.isActive(unit) != a.isActive(unit)) {
                return +b.isActive(unit) - +a.isActive(unit)
            } else {
                return b.priority - a.priority
            }
        })
        const currentAnimations = sortedAnimations.filter(
            animation => animation.priority === sortedAnimations[0].priority && animation.isActive(unit),
        )

        currentAnimations.forEach(animation => !this.current.includes(animation) && animation.play())
        this.current.forEach(animation => !currentAnimations.includes(animation) && animation.stop())
        this.current = currentAnimations
    }
    public mixer: THREE.AnimationMixer
    public list: Array<Animation>
    private clips: Array<THREE.AnimationClip>
    private current: Array<Animation>
}
