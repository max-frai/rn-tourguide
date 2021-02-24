import * as React from 'react'
import { TourGuideContext, ITourGuideContext } from '../components/TourGuideContext'

export const useTourGuideController = (context: React.Context<ITourGuideContext> = TourGuideContext) => {
  const {
    start,
    canStart,
    stop,
    eventEmitter,
    getCurrentStep,
  } = React.useContext(context)
  return {
    start,
    stop,
    eventEmitter,
    getCurrentStep,
    canStart,
  }
}
