import * as React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { BorderRadiusObject, Shape } from '../types'
import { TourGuideZone } from './TourGuideZone'
import { ITourGuideContext } from './TourGuideContext'

interface TourGuideZoneByPositionProps {
  zone: number
  isTourGuide?: boolean
  top?: number | string
  left?: number | string
  right?: number | string
  bottom?: number | string
  width?: number | string
  height?: number | string
  shape?: Shape
  borderRadiusObject?: BorderRadiusObject
  containerStyle?: StyleProp<ViewStyle>
  keepTooltipPosition?: boolean
  tooltipBottomOffset?: number
  text?: string
  context?: React.Context<ITourGuideContext>
}

export const TourGuideZoneByPosition = ({
  isTourGuide,
  zone,
  width,
  height,
  top,
  left,
  right,
  bottom,
  shape,
  containerStyle,
  keepTooltipPosition,
  tooltipBottomOffset,
  borderRadiusObject,
  text,
  context,
}: TourGuideZoneByPositionProps) => {
  if (!isTourGuide) {
    return null
  }

  return (
    <View
      pointerEvents='none'
      style={[StyleSheet.absoluteFillObject, containerStyle]}
    >
      <TourGuideZone
        isTourGuide
        {...{
          zone,
          shape,
          keepTooltipPosition,
          tooltipBottomOffset,
          borderRadiusObject,
          text,
          context,
        }}
        style={{
          position: 'absolute',
          height,
          width,
          top,
          right,
          bottom,
          left,
        }}
      />
    </View>
  )
}
