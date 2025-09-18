'use client';

import { List } from '@refinedev/antd';
import { Alert, Button, Input, message } from 'antd';
import { useState } from 'react';
import { mapQuestionsAndAnswers, TopicLevelMap } from './parser/splitter';
import { MarkdownRenderer } from './markdown-renderer';

const { TextArea } = Input;

export function QuestionContainer() {
	const [text, setText] = useState('');
	const [warnings, setWarnings] = useState<string[]>([]);
	const [processedContent, setProcessedContent] = useState<TopicLevelMap | null>(null);

	const handleSubmit = () => {
		const result = mapQuestionsAndAnswers(text);

		// Set warnings for display
		setWarnings(result.warnings);

		// Set processed content for display
		setProcessedContent(result.questions);

		if (result.warnings.length > 0) {
			message.warning(`Parsed with ${result.warnings.length} warning(s). Check the warnings section.`);
		} else {
			message.success('Parsed successfully! No issues found.');
		}

		console.log('Questions:', result.questions);
		console.log('Warnings:', result.warnings);
	};

	const handleClear = () => {
		setText('');
		setWarnings([]);
		setProcessedContent(null);
		message.info('Cleared');
	};

	return (
		<List>
			<div style={{ padding: '24px' }}>
				<div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
					<Button
						type="primary"
						onClick={handleSubmit}
					>
						Parse Markdown
					</Button>
					<Button onClick={handleClear}>Clear</Button>
				</div>

				{/* Display warnings if any */}
				{warnings.length > 0 && (
					<div style={{ marginBottom: '16px' }}>
						<Alert
							type="warning"
							message="Processing Warnings"
							description={
								<ul style={{ margin: 0, paddingLeft: '20px' }}>
									{warnings.map((warning, index) => (
										<li key={index} style={{ marginBottom: '4px' }}>
											{warning}
										</li>
									))}
								</ul>
							}
							closable
							onClose={() => setWarnings([])}
							showIcon
						/>
					</div>
				)}

				<TextArea
					rows={20}
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Paste your markdown content here..."
					style={{ fontSize: '14px', fontFamily: 'monospace' }}
				/>

				{/* Markdown Renderer Component */}
				<MarkdownRenderer content={processedContent} />
			</div>
		</List>
	);
}
