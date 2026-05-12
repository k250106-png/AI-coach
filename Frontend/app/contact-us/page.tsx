'use client';

import { FormEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PublicIcon from '@mui/icons-material/Public';

interface ContactState {
  name: string;
  email: string;
  company: string;
  message: string;
}

const initialState: ContactState = {
  name: '',
  email: '',
  company: '',
  message: '',
};

export default function ContactUsPage() {
  const [form, setForm] = useState<ContactState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setForm(initialState);
  };

  return (
    <Box className="pro-page" sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card className="pro-panel vetto-spotlight" data-reveal="left" sx={{ borderRadius: 5, height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography className="section-kicker">Contact Us</Typography>
                <Typography variant="h3" sx={{ mt: 1.5, fontWeight: 850, letterSpacing: '-0.03em' }}>
                  Let us build your interview edge.
                </Typography>
                <Typography sx={{ mt: 2, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                  Whether you are a candidate, recruiter, or training partner, the MIRA team can help you deploy a smarter interview workflow.
                </Typography>

                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Box className="vetto-contact-row">
                    <MailOutlineIcon fontSize="small" />
                    <Typography variant="body2">support@mira.ai</Typography>
                  </Box>
                  <Box className="vetto-contact-row">
                    <PhoneInTalkIcon fontSize="small" />
                    <Typography variant="body2">+92 300 0000000</Typography>
                  </Box>
                  <Box className="vetto-contact-row">
                    <PublicIcon fontSize="small" />
                    <Typography variant="body2">Lahore, Pakistan</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card className="pro-card" data-reveal="right" sx={{ borderRadius: 5 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Send a message</Typography>

                {submitted ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Your message has been captured. We will contact you soon.
                  </Alert>
                ) : null}

                <Box component="form" onSubmit={onSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Full Name"
                        value={form.name}
                        onChange={(event) => setForm(prev => ({ ...prev, name: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        type="email"
                        label="Email"
                        value={form.email}
                        onChange={(event) => setForm(prev => ({ ...prev, email: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Company (optional)"
                        value={form.company}
                        onChange={(event) => setForm(prev => ({ ...prev, company: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        multiline
                        minRows={5}
                        label="Message"
                        value={form.message}
                        onChange={(event) => setForm(prev => ({ ...prev, message: event.target.value }))}
                      />
                    </Grid>
                  </Grid>

                  <Button type="submit" variant="contained" className="neon-button" sx={{ mt: 3 }}>
                    Submit Request
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
