
import React from 'react';
import { Container } from '@mui/material';
import CMCModule from '../modules/CMCModule';

export default function CMCPage() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <CMCModule />
    </Container>
  );
}
