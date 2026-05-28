import sfxUiButton2Url from '../assets/sound-effects/UI_device_button2.mp3?url'
import sfxUiButton3Url from '../assets/sound-effects/UI_device_button3.mp3?url'
import sfxUiButton4Url from '../assets/sound-effects/UI_device_button4.mp3?url'
import sfxUiButton5Url from '../assets/sound-effects/UI_device_button5.mp3?url'
import sfxUiButton6Url from '../assets/sound-effects/UI_device_button6.mp3?url'
import sfxUiNavSwishUrl from '../assets/sound-effects/Short Air Swhish.mp3?url'
import sfxPlanetAmbLoopUrl from '../assets/sound-effects/Atmosphere_Lowloop_planetAMB.mp3?url'
import sfxAlienshipScan4Url from '../assets/sound-effects/Alienship Scanning 4.mp3?url'
import sfxAlienshipScanLowUrl from '../assets/sound-effects/AlienshipScanningLOW3.mp3?url'

export const uiButtonSampleNames = [
  'ui-button-2',
  'ui-button-3',
  'ui-button-4',
  'ui-button-5',
  'ui-button-6'
] as const

export const uiButtonNavigationSampleNames = [
  'ui-nav-swish',
  'ui-button-2',
  'ui-button-3'
] as const

export const uiButtonConfirmSampleNames = [
  'ui-button-4',
  'ui-button-6'
] as const

export const uiButtonDangerSampleNames = [
  'ui-button-5'
] as const

export const sfxSamples = {
  'ui-nav-swish': sfxUiNavSwishUrl,
  'ui-button-2': sfxUiButton2Url,
  'ui-button-3': sfxUiButton3Url,
  'ui-button-4': sfxUiButton4Url,
  'ui-button-5': sfxUiButton5Url,
  'ui-button-6': sfxUiButton6Url,
  'planet-amb-loop': sfxPlanetAmbLoopUrl,
  'alienship-scan-high': sfxAlienshipScan4Url,
  'alienship-scan-low': sfxAlienshipScanLowUrl
} as const
