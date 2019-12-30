import * as THREE from 'three'
import Weapon from './Weapon'
import Unit from '../Unit/Unit'
import Action from '../Action'
import ShotgunBullet from '../Projectile/ShotgunBullet'
import Sounds from '../Sounds'

const options = {
    bullets: 7,
    firerate: 2,
    bulletSpeed: 1200,
    reloadDuration: 500,
}

export default class Shotgun extends Weapon {
    constructor(owner: Unit) {
        super()
        const duration = 1000 / options.firerate
        const animation = owner.animations.list.find(animation => animation.name === 'shoot')
        if (animation) animation.setDuration(duration / 1000)
        this.name = 'Shotgun'
        this.sounds = new Sounds([{ url: 'sounds/shotgun/shoot.wav' }, { url: 'sounds/shotgun/reload.wav' }])

        this.bullets = this.maxBullets = options.bullets
        this.actions = [
            new Action({
                name: 'shoot',
                duration,
                unit: owner,
                onStart: (direction: THREE.Vector2): boolean => {
                    if (this.bullets > 0) {
                        this.sounds.play('shoot')
                        this.sounds.reinit({ url: 'sounds/shotgun/shoot.wav' })
                        this.bullets--
                        for (let i = -8; i < 9; i++) {
                            const newDirection = direction
                                .clone()
                                .rotateAround(new THREE.Vector2(0, 0), 0.3 * (Math.random() - 0.5))
                            new ShotgunBullet(owner, newDirection, {
                                speed: options.bulletSpeed * (1 + 0.1 * Math.random()),
                            })
                        }
                        return true
                    } else {
                        return false
                    }
                },
                onStop: () => {},
                onComplete: () => {},
            }),
            new Action({
                name: 'reload',
                duration: options.reloadDuration,
                unit: owner,
                onStart: (): boolean => {
                    if (this.bullets < this.maxBullets) {
                        this.sounds.load('reload')
                        this.sounds.play('reload')
                        return true
                    } else {
                        return false
                    }
                },
                onStop: () => {
                    this.sounds.pause('reload')
                },
                onComplete: () => {
                    this.sounds.pause('reload')
                    this.bullets++
                },
            }),
        ]
    }
    public name: string
    public actions: Action[]
    public bullets: number
    public maxBullets: number
    private sounds: Sounds
}
