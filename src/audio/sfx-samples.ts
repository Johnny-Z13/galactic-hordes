// button1 source was not re-exported as MP3; reuse button2 for slot 1 so the
// three-way round-robin still works. Swap in a dedicated button1.mp3 later.
import sfxUiButton1Url from '../assets/sound-effects/UI_device_button2.mp3?url'
import sfxUiButton2Url from '../assets/sound-effects/UI_device_button2.mp3?url'
import sfxUiButton3Url from '../assets/sound-effects/UI_device_button3.mp3?url'
import sfxUiButton4Url from '../assets/sound-effects/UI_device_button4.mp3?url'
import sfxUiButton5Url from '../assets/sound-effects/UI_device_button5.mp3?url'
import sfxUiButton6Url from '../assets/sound-effects/UI_device_button6.mp3?url'
import sfxPlanetAmbLoopUrl from '../assets/sound-effects/Atmosphere_Lowloop_planetAMB.mp3?url'
import sfxAlienshipScan4Url from '../assets/sound-effects/Alienship Scanning 4.mp3?url'
import sfxAlienshipScanLowUrl from '../assets/sound-effects/AlienshipScanningLOW3.mp3?url'

export const uiButtonSampleNames = [
  'ui-button-1',
  'ui-button-2',
  'ui-button-3',
  'ui-button-4',
  'ui-button-5',
  'ui-button-6'
] as const

export const sfxSamples = {
  'ui-button-1': sfxUiButton1Url,
  'ui-button-2': sfxUiButton2Url,
  'ui-button-3': sfxUiButton3Url,
  'ui-button-4': sfxUiButton4Url,
  'ui-button-5': sfxUiButton5Url,
  'ui-button-6': sfxUiButton6Url,
  'planet-amb-loop': sfxPlanetAmbLoopUrl,
  'alienship-scan-high': sfxAlienshipScan4Url,
  'alienship-scan-low': sfxAlienshipScanLowUrl
} as const
