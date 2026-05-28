import {
  uiButtonConfirmSampleNames,
  uiButtonDangerSampleNames,
  uiButtonNavigationSampleNames
} from './sfx-samples'

export type UiClickSoundKind = 'navigation' | 'confirm' | 'danger'

export interface UiClickSoundButton {
  classList: Pick<DOMTokenList, 'contains'>
  dataset: {
    uiSound?: string
    confirm?: string
  }
}

export interface UiClickSoundCue {
  kind: UiClickSoundKind
  sample: string
  gain: number
  rate: number
}

const uiClickSoundPools = {
  navigation: uiButtonNavigationSampleNames,
  confirm: uiButtonConfirmSampleNames,
  danger: uiButtonDangerSampleNames
} as const

export function uiClickSoundForButton(button: UiClickSoundButton, index: number): UiClickSoundCue {
  const kind = uiClickSoundKindForButton(button)
  const pool = uiClickSoundPools[kind]
  return {
    kind,
    sample: pool[index % pool.length],
    gain: kind === 'danger' ? 0.52 : kind === 'confirm' ? 0.5 : 0.42,
    rate: kind === 'danger' ? 0.92 : kind === 'confirm' ? 1.04 : 1
  }
}

function uiClickSoundKindForButton(button: UiClickSoundButton): UiClickSoundKind {
  if (button.dataset.uiSound === 'confirm') return 'confirm'
  if (button.dataset.uiSound === 'danger') return 'danger'
  if (button.dataset.uiSound === 'navigation') return 'navigation'
  if (button.classList.contains('danger')) return 'danger'
  if (button.dataset.confirm === 'true') return 'danger'
  if (button.classList.contains('workbench-install-choice')) return 'confirm'
  if (button.classList.contains('start-button')) return 'confirm'
  if (button.classList.contains('primary')) return 'confirm'
  return 'navigation'
}
