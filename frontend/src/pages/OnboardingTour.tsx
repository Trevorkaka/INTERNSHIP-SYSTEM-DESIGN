// @ts-ignore
import Joyride, { Step } from 'react-joyride'

interface Props {
  role: string
}



export default function OnboardingTour({ role }: Props) {


  const studentSteps: Step[] = [
    {
      target: '.dashboard-overview',
      content: 'Welcome to the Internship Logging & Evaluation System dashboard.',
      //disableBeacon: true,
    },
    {
      target: '.logbook-section',
      content: 'This section allows you to submit your daily internship logbook entries.',
    },
    {
      target: '.attendance-section',
      content: 'Track your attendance and internship activity here.',
    },
    {
      target: '.reports-section',
      content: 'Generate and view internship reports from this section.',
    },
    {
      target: '.profile-section',
      content: 'Manage your profile and account settings here.',
    },
  ]

  const academicSupervisorSteps: Step[] = [
    {
      target: '.dashboard-overview',
      content: 'Welcome Academic Supervisor. This dashboard helps you manage assigned students.',
      //disableBeacon: true,
    },
    {
      target: '.students-section',
      content: 'View all assigned students and monitor their internship progress.',
    },
    {
      target: '.evaluation-section',
      content: 'Evaluate students and submit performance assessments here.',
    },
    {
      target: '.reports-section',
      content: 'Review submitted reports and internship summaries here.',
    },
  ]

  const workplaceSupervisorSteps: Step[] = [
    {
      target: '.dashboard-overview',
      content: 'Welcome Workplace Supervisor. This dashboard helps manage intern workplace activities.',
      //disableBeacon: true,
    },
    {
      target: '.attendance-section',
      content: 'Review student attendance and daily participation here.',
    },
    {
      target: '.evaluation-section',
      content: 'Assess workplace performance and provide feedback here.',
    },
    {
      target: '.reports-section',
      content: 'View internship activity reports and evaluations here.',
    },
  ]

  const getSteps = () => {
    switch (role) {
      case 'student':
        return studentSteps

      case 'academic_supervisor':
        return academicSupervisorSteps

      case 'workplace_supervisor':
        return workplaceSupervisorSteps

      default:
        return []
    }
  }

  return (
    <Joyride
      steps={getSteps()}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableScrolling={false}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  )
}