export const ONBOARDING_PLANET_COUNT = 5

export const useOnboardingPlanetField = (chunkX: number, chunkY: number, visitedPlanets: number) => (
  chunkX === 0 && chunkY === 0 && visitedPlanets === 0
)

export const onboardingPlanetSlot = (index: number) => {
  const slots = [
    { x: 220, y: -130 },
    { x: -260, y: 160 },
    { x: 520, y: 120 },
    { x: -540, y: -80 },
    { x: 80, y: 520 }
  ]
  return slots[index % slots.length]
}
