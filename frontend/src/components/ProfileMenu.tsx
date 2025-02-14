import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../firebase/auth';
import { getUserSummaries } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [summaries, setSummaries] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchSummaries = async () => {
      if (user) {
        try {
          const userSummaries = await getUserSummaries(user.uid);
          setSummaries(userSummaries);
        } catch (error) {
          console.error('Error fetching summaries:', error);
        }
      }
    };

    if (open) {
      fetchSummaries();
    }
  }, [user, open]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      handleClose();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSummaryClick = (summaryId: string) => {
    navigate(`/summary/${summaryId}`);
    handleClose();
  };

  const handleCreateNew = () => {
    navigate('/summary/new');
    handleClose();
  };

  return (
    <div>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {user?.photoURL ? (
          <Avatar
            src={user.photoURL}
            alt={user.displayName || 'User'}
            sx={{ width: 32, height: 32 }}
          />
        ) : (
          <AccountCircleIcon sx={{ width: 32, height: 32 }} />
        )}
      </IconButton>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: '300px',
            maxHeight: '400px',
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar
            src={user?.photoURL || undefined}
            sx={{ width: 60, height: 60, margin: '0 auto' }}
          />
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            {user?.displayName || user?.email || 'Guest'}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleCreateNew}
            sx={{ mb: 1 }}
          >
            Create New Quote
          </Button>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Saved Quotes"
                primaryTypographyProps={{
                  variant: 'subtitle2',
                  color: 'text.secondary',
                }}
              />
            </ListItem>
            {summaries.map((summary) => (
              <MenuItem
                key={summary.id}
                onClick={() => handleSummaryClick(summary.id)}
                sx={{
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                <ListItemText
                  primary={summary.companyInfo?.companyName || 'Untitled Quote'}
                  secondary={new Date(summary.updatedAt?.seconds * 1000).toLocaleDateString()}
                />
              </MenuItem>
            ))}
          </List>
        </Box>
        <Divider />
        <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
      </Menu>
    </div>
  );
};

export default ProfileMenu;
