import { Paper, Typography, Box, TextField } from '@mui/material';

interface HeaderProps {
  clientName: string;
  onClientNameChange: (name: string) => void;
}

const Header = ({ clientName, onClientNameChange }: HeaderProps) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <img src="/logo.png" alt="Company Logo" style={{ height: '50px' }} />
          <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
            Price Quote Generator
          </Typography>
        </Box>
        <TextField
          label="Client Name"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          variant="outlined"
          sx={{ minWidth: '200px' }}
        />
      </Box>
    </Paper>
  );
};

export default Header;
