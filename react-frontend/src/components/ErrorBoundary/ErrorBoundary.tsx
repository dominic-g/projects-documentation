import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Center, Alert, Title, Text, Button, Box, Code } from '@mantine/core';
import { IconReload, IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  // This lifecycle method is invoked after an error has been thrown by a descendant component.
  public static getDerivedStateFromError(error: Error): State {
    console.error("ErrorBoundary caught an unrecoverable error:", error);
    return { hasError: true, errorMessage: error.message };
  }

  // This lifecycle is called with information about the error.
  public componentDidCatch(_error: Error, errorInfo: ErrorInfo) {
    console.error("Logging component error info:", errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Custom Fallback UI for when the app truly crashes
      return (
        <Center style={{ minHeight: '100vh', textAlign: 'center' }}>
          <Alert 
            icon={<IconAlertTriangle size={32} />} 
            title={<Title order={2} c="red">Application Crash!</Title>}
            c="red"
            variant="filled"
            w={600}
            radius="md"
            style={{ 
                margin: '20px auto', 
                textAlign: 'left'
            }}
          >
            <Text>
              An unrecoverable error occurred during rendering. This is likely due to malformed component data (e.g., malformed JSON/MDX content, or an incorrect value passed to a component).
            </Text>
            
            <Box mt="md" fz="xs">
                <Code
                    mt="md" 
                >
                    {this.state.errorMessage}
                </Code>
            </Box>

            <Text fz="sm" mt="md">
              The only way to resolve this is to correct the data in your WordPress editor, then reload the page.
            </Text>

            <Button 
                fullWidth 
                mt="xl" 
                variant="white" 
                color="dark"
                leftSection={<IconReload size={20} />}
                onClick={() => window.location.reload()}
            >
              Attempt to Reload Application
            </Button>
          </Alert>
        </Center>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;