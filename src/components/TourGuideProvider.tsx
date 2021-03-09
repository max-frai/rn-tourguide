import mitt from 'mitt'
import * as React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { TourGuideContext, ITourGuideContext } from '../components/TourGuideContext'
import { IStep, Labels, StepObject, Steps } from '../types'
import * as utils from '../utilities'
import { Modal } from './Modal'
import { OFFSET_WIDTH } from './style'
import { TooltipProps } from './Tooltip'
import { RefObject } from 'react'


/*
This is the maximum wait time for the steps to be registered before starting the tutorial
At 60fps means 2 seconds
*/
const MAX_START_TRIES = 120

export interface TourGuideProviderProps {
  tooltipComponent?: React.ComponentType<TooltipProps>
  tooltipStyle?: StyleProp<ViewStyle>
  labels?: Labels
  androidStatusBarVisible?: boolean
  startAtMount?: boolean
  backdropColor?: string
  verticalOffset?: number
  wrapperStyle?: StyleProp<ViewStyle>
  maskOffset?: number
  borderRadius?: number
  animationDuration?: number
  children: React.ReactNode
  context?: React.Context<ITourGuideContext>
}

export interface TourGuideProviderState {
  visible: boolean;
  steps: Steps;
  currentStep: IStep | undefined;
  canStart: boolean;
}

export class TourGuideProvider extends React.Component<TourGuideProviderProps, TourGuideProviderState> {
  eventEmitter: mitt.Emitter = new mitt()
  modal?: RefObject<Modal>;
  startTries: number;
  constructor(props: TourGuideProviderProps) {
    super(props)
    this.startTries = 0;
    this.state = {
      visible: false,
      steps: {},
      currentStep: undefined,
      canStart: false
    }
  }

  componentDidUpdate(_prevProps: TourGuideProviderProps, prevState: TourGuideProviderState) {
    if (this.state.visible !== prevState.visible || this.state.currentStep !== prevState.currentStep) {
      if (this.state.visible || this.state.currentStep) {
        this.moveToCurrentStep()
      }
    }

    if (this.state.steps !== prevState.steps) {
      if (Object.entries(this.state.steps).length > 0) {
        this.setState({ canStart: true })
        if (this.props.startAtMount) {
          this.start()
        }
      } else {
        this.setState({ canStart: false })
      }
    }

    if (this.state.visible === false && prevState.visible === true) {
      this.eventEmitter.emit('stop')
    }
  }

  async moveToCurrentStep() {
    const size = await this.state.currentStep!.target.measure()
    if (isNaN(size.width) || isNaN(size.height) || isNaN(size.x) || isNaN(size.y)) {
      return;
    }
    // @ts-ignore
    await this.modal?.animateMove({
      width: size.width + OFFSET_WIDTH,
      height: size.height + OFFSET_WIDTH,
      left: Math.round(size.x) - OFFSET_WIDTH / 2,
      top: Math.round(size.y) - OFFSET_WIDTH / 2 + (this.props.verticalOffset || 0),
    })
  }

  setCurrentStep(step?: IStep) {
    this.setState({ currentStep: step })
    this.eventEmitter.emit('stepChange', step)
  }

  getNextStep(step: IStep | undefined = this.state.currentStep) {
    return utils.getNextStep(this.state.steps!, step)
  }

  getPrevStep(step: IStep | undefined = this.state.currentStep) {
    return utils.getPrevStep(this.state.steps!, step)
  }

  getFirstStep() { return utils.getFirstStep(this.state.steps!) }

  getLastStep() { return utils.getLastStep(this.state.steps!) }
  isFirstStep() { return this.state.currentStep === this.getFirstStep() }
  isLastStep() { return this.state.currentStep === this.getLastStep() }

  next() { this.setCurrentStep(this.getNextStep()!) }

  prev() { this.setCurrentStep(this.getPrevStep()!) }

  stop() {
    this.setState({ visible: false, currentStep: undefined })
  }

  registerStep(step: IStep) {
    this.setState((prevState) => {
      const newSteps = {
        ...prevState.steps!,
        [step.name]: step,
      };
      return { steps: newSteps }
    })
  }

  unregisterStep(stepName: string) {
    const newStepsState = Object.entries(this.state.steps as StepObject)
      .filter(([key]) => key !== stepName)
      .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})

    this.setState({ steps: newStepsState })
  }

  getCurrentStep() { return this.state.currentStep }

  async start(fromStep?: number) {
    const currentStep = fromStep
      ? (this.state.steps as StepObject)[fromStep]
      : this.getFirstStep()


    if (this.startTries > MAX_START_TRIES) {
      this.startTries = 0
      return
    }
    if (!currentStep) {
      this.startTries += 1
      requestAnimationFrame(() => this.start(fromStep))
    } else {
      this.eventEmitter.emit('start')
      this.startTries = 0
      this.setCurrentStep(currentStep!)
      this.setState({ visible: true })
    }
  }

  render() {
    const {
      children,
      wrapperStyle,
      labels,
      tooltipComponent,
      tooltipStyle,
      androidStatusBarVisible,
      backdropColor,
      animationDuration,
      maskOffset,
      borderRadius,
      context,
    } = this.props

    const ContextProvider = context?.Provider ?? TourGuideContext.Provider

    return (
      <View style={[styles.container, wrapperStyle]}>
        <ContextProvider
          value={{
            eventEmitter: this.eventEmitter,
            registerStep: this.registerStep.bind(this),
            unregisterStep: this.unregisterStep.bind(this),
            getCurrentStep: this.getCurrentStep.bind(this),
            start: this.start.bind(this),
            stop: this.stop.bind(this),
            canStart: this.state.canStart,
          }}
        >
          {children}
          <Modal
            ref={(ref: any) => {
              this.modal = ref
            }}
            {...{
              next: this.next.bind(this),
              prev: this.prev.bind(this),
              stop: this.stop.bind(this),
              visible: this.state.visible,
              isFirstStep: this.isFirstStep(),
              isLastStep: this.isLastStep(),
              currentStep: this.state.currentStep,
              labels,
              tooltipComponent,
              tooltipStyle,
              androidStatusBarVisible,
              backdropColor,
              animationDuration,
              maskOffset,
              borderRadius,
            }}
          />
        </ContextProvider>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
