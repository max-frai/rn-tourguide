import * as React from 'react'
import { BorderRadiusObject, Shape } from '../types'
import { ConnectedStep } from './ConnectedStep'
import { TourGuideContext, ITourGuideContext } from './TourGuideContext'

interface Props {
  name: string
  order: number
  text: string
  shape?: Shape
  active?: boolean
  maskOffset?: number
  borderRadius?: number
  children: React.ReactNode
  keepTooltipPosition?: boolean
  tooltipBottomOffset?: number
  borderRadiusObject?: BorderRadiusObject
  context?: React.Context<ITourGuideContext>
}

export const Step = (props: Props) => {
  const context = React.useContext(props.context ?? TourGuideContext)
  return <ConnectedStep {...{ ...props, context }} />
}
