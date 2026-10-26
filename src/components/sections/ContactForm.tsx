import React from 'react';
import { TextField, Button, Snackbar, Alert, CircularProgress, Tooltip } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateForm, submitForm, resetStatus } from '../../store/slices/contactSlice';
import { RootState } from '../../store/store';
import { useTheme } from '../../hooks/useTheme';

const useMuiTheme = () => {
  const { theme } = useTheme();
  return createTheme({
    palette: {
      mode: theme.mode,
      primary: {
        main: theme.colors.primary,
      },
      error: {
        main: theme.colors.error,
      },
    },
  });
};

/** LinkedIn hover tip. Same chunk as the form so MUI loads once. */
export const LinkedInTip: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const muiTheme = useMuiTheme();
  return (
    <ThemeProvider theme={muiTheme}>
      <Tooltip title="Connect with me on LinkedIn if email is unavailable!" arrow>
        {children}
      </Tooltip>
    </ThemeProvider>
  );
};

/**
 * MUI contact fields, in their own vendor chunk. Markup matches the
 * previous inline form so the section looks the same on every theme.
 */
const ContactForm: React.FC = () => {
  const dispatch = useDispatch();
  const { form, isSubmitting, isSuccess, isError, errorMessage } = useSelector(
    (state: RootState) => state.contact
  );
  const muiTheme = useMuiTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(updateForm({ [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(submitForm());
  };

  const handleCloseSnackbar = () => {
    dispatch(resetStatus());
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={form.name}
          onChange={handleInputChange}
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleInputChange}
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={handleInputChange}
          required
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Message"
          name="message"
          value={form.message}
          onChange={handleInputChange}
          required
          multiline
          rows={5}
          variant="outlined"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
          size="large"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>

      <Snackbar
        open={isSuccess || isError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={isSuccess ? 'success' : 'error'}
          variant="filled"
          icon={isSuccess ? <CheckCircle /> : <AlertCircle />}
        >
          {isSuccess ? (
            'Your message has been sent successfully!'
          ) : (
            <>
              Failed to send message: {errorMessage}.
              <br />
              <span className="font-semibold">
                Please reach out via LinkedIn if email is unavailable!
              </span>
            </>
          )}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default ContactForm;
