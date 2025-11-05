import React from 'react'

type Props = { children: React.ReactNode, fallback?: React.ReactNode }

type State = { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: any): State {
		return { hasError: true, error }
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback ?? <div style={{ padding: 16 }}>Something went wrong.</div>
		}
		return this.props.children
	}
}


