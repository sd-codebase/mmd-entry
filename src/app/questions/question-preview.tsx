import React, { useEffect, useRef } from 'react';
// import './question-preview.css';

interface QuestionPreviewProps {
	content: string;
}

// Declare global window interface for mathpix functions
declare global {
	interface Window {
		markdownToHTML: (text: string, options?: any) => string;
		loadMathJax: () => boolean;
		MathJax: any;
	}
}

export function QuestionPreview({ content }: QuestionPreviewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scriptLoadedRef = useRef(false);

	const renderContent = React.useCallback(() => {
		if (!containerRef.current || !content) return;

		if (window.markdownToHTML) {
			const options = {
				htmlTags: true,
				// width: 800,
				// breaks: true,
				// typographer: true,
				// linkify: true,
				// outMath: {
				// 	include_latex: true,
				// 	include_svg: true,
				// 	include_mathml: false,
				// },
			};

			const html = window.markdownToHTML(content, options);
			containerRef.current.innerHTML = html;

			// Re-typeset MathJax if available
			if (window.MathJax && window.MathJax.typeset) {
				window.MathJax.typeset([containerRef.current]);
			}
		} else {
			// Fallback to plain text if script not loaded yet
			containerRef.current.textContent = content;
		}
	}, [content]);

	useEffect(() => {
		// Load the mathpix-markdown-it script if not already loaded
		if (!scriptLoadedRef.current && typeof window !== 'undefined') {
			const script = document.createElement('script');
			script.src =
				'https://cdn.jsdelivr.net/npm/mathpix-markdown-it@2.0.6/es5/bundle.js';

			script.onload = () => {
				scriptLoadedRef.current = true;
				// Initialize MathJax
				if (window.loadMathJax) {
					window.loadMathJax();
				}
				// Re-render content after script loads
				renderContent();
			};

			document.head.appendChild(script);

			// // Load styles
			// const link = document.createElement('link');
			// link.rel = 'stylesheet';
			// link.href =
			// 	'https://cdn.jsdelivr.net/npm/mathpix-markdown-it@2.0.6/css/styles.css';
			// document.head.appendChild(link);
		} else {
			renderContent();
		}
	}, [renderContent]);

	useEffect(() => {
		renderContent();
	}, [content, renderContent]);

	return (
		<div
			ref={containerRef}
			className="question-preview-isolated"
			style={{
				// Reset all inherited styles
				all: 'initial',
				// Apply only necessary styles
				display: 'block',
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				fontSize: '150%',
				lineHeight: '2',
				color: '#000',
				backgroundColor: 'transparent',
				padding: '0',
				margin: '0',
				boxSizing: 'border-box',
				// Ensure mathpix styles work
				position: 'relative',
			}}
		/>
	);
}
