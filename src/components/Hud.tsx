import React, { ReactElement, useState } from 'react'
import Swat from '../objects/Unit/Swat'
import World from '../objects/World'

function Hud({ state }: any): ReactElement {
    const { player } = state
    return player instanceof Swat ? (
        <div className={'hud'}>
            <div className={'energybar'}>
                <div className={'available'} style={{ width: `${(100 * player.energy) / player.maxEnergy}%` }} />
                <div className={'missing'} />
            </div>
            <div className={'healthbar'}>
                <div className={'available'} style={{ width: `${Math.max((100 * player.hp) / player.maxHp, 0)}%` }} />
                <div className={'missing'} />
            </div>
            <div className={'weaponbar'}>
                <span>{`${player.currentWeapon.name} ${player.currentWeapon.bullets}/${
                    player.currentWeapon.maxBullets
                    // eslint-disable-next-line
                }${player.currentAction?.name === 'reload' ? ' Reloading...' : ''}`}</span>
            </div>
            <div className={'optionsbar'}>
                <img src={'icons/sound.png'} alt={'sound'} className="sound-icon" />
                <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue={World.SOUNDS_LEVEL * 100}
                    className="sound-slider"
                    onChange={e => {
                        World.SOUNDS_LEVEL = Number(e.target.value) / 100
                    }}
                />
            </div>
        </div>
    ) : (
        <> </>
    )
}

export default Hud
