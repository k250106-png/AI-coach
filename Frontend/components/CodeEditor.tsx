'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography, CircularProgress } from '@mui/material';
import { PlayArrow, Download, ContentCopy } from '@mui/icons-material';

interface CodeEditorProps {
  language?: 'python' | 'javascript' | 'java' | 'cpp' | 'go';
  defaultCode?: string;
  onCodeChange?: (code: string) => void;
  onSubmit?: (code: string) => Promise<void>;
  readOnly?: boolean;
  theme?: 'dark' | 'light';
  showExecute?: boolean;
  showOutput?: boolean;
}

/**
 * Lightweight Code Editor Component
 * Renders a code editor with syntax highlighting and execution buttons
 * In production, integrate with Monaco Editor or CodeMirror
 */
export default function CodeEditor({
  language = 'python',
  defaultCode = '',
  onCodeChange,
  onSubmit,
  readOnly = false,
  theme = 'dark',
  showExecute = true,
  showOutput = true,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  // Generate line numbers
  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleExecute = async () => {
    setIsRunning(true);
    try {
      // Call backend code execution endpoint
      const response = await fetch('/api/interview/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setOutput(data.output || data.error || 'No output');

      if (onSubmit) {
        await onSubmit(code);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      java: 'java',
      cpp: 'cpp',
      go: 'go',
    };

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`);
    element.setAttribute('download', `solution.${extensions[language]}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Stack spacing={2}>
      <Card
        sx={{
          background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          border: '1px solid rgba(147, 197, 253, 0.2)',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid rgba(147, 197, 253, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#93C5FD' }}>
                {language.toUpperCase()}
              </Typography>
              {language && (
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {language === 'python'
                    ? 'Python 3.10'
                    : language === 'javascript'
                      ? 'Node.js 18'
                      : language === 'java'
                        ? 'Java 17'
                        : language === 'cpp'
                          ? 'C++ 20'
                          : 'Go 1.19'}
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={handleCopy}
                sx={{
                  borderColor: 'rgba(147, 197, 253, 0.3)',
                  color: '#93C5FD',
                  '&:hover': { borderColor: '#93C5FD' },
                }}
              >
                Copy
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownload}
                sx={{
                  borderColor: 'rgba(147, 197, 253, 0.3)',
                  color: '#93C5FD',
                  '&:hover': { borderColor: '#93C5FD' },
                }}
              >
                Download
              </Button>
            </Stack>
          </Box>

          {/* Editor Area */}
          <Box sx={{ display: 'flex', fontFamily: 'monospace', fontSize: '13px' }}>
            {/* Line Numbers */}
            <Box
              sx={{
                background: theme === 'dark' ? '#0f0f0f' : '#efefef',
                borderRight: '1px solid rgba(147, 197, 253, 0.1)',
                p: '12px 8px',
                textAlign: 'right',
                color: '#64748B',
                userSelect: 'none',
                minWidth: '40px',
              }}
            >
              {lineNumbers.map(line => (
                <div key={line}>{line}</div>
              ))}
            </Box>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              readOnly={readOnly}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px',
                fontFamily: 'Monaco, "Courier New", monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                color: '#F7F8FD',
                resize: 'vertical',
                minHeight: '300px',
                tabSize: 2,
              }}
              spellCheck="false"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Buttons */}
      {showExecute && !readOnly && (
        <Button
          fullWidth
          variant="contained"
          startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrow />}
          onClick={handleExecute}
          disabled={isRunning}
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            fontWeight: 700,
          }}
        >
          {isRunning ? 'Running...' : 'Execute Code'}
        </Button>
      )}

      {/* Output */}
      {showOutput && output && (
        <Card
          sx={{
            background: theme === 'dark' ? '#0f0f0f' : '#f5f5f5',
            border: '1px solid rgba(147, 197, 253, 0.2)',
            maxHeight: '200px',
            overflow: 'auto',
          }}
        >
          <CardContent>
            <Typography variant="caption" sx={{ color: '#93C5FD', fontWeight: 700, mb: 1 }}>
              OUTPUT
            </Typography>
            <Typography
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#F7F8FD',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {output}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
