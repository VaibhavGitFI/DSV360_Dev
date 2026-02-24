// import React from 'react'
// import { Paper, Box, Avatar, Typography, TextField, Button } from "@mui/material";
// import { alpha, useTheme } from "@mui/material/styles";


// export const Header = ({title,icon,searchLabel,searchValue,onSearchChange,primaryBtnLabel,onPrimaryClick,secondaryBtnLabel,onSecondaryClick,}) => {
//     const theme = useTheme();

//   return (
//        <Paper
//       elevation={0}
//       sx={{
//         mb: 4,
//         p: { xs: 2, sm: 3 },
//         borderRadius: 3,
//         background: `linear-gradient(135deg, ${alpha(
//           theme.palette.primary.main,
//           0.08
//         )} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
//         boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
//         display: "flex",
//         flexDirection: { xs: "column", md: "row" },
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 2,
//       }}
//     >
//       {/* Left */}
//       <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//         <Avatar
//           sx={{
//             bgcolor: theme.palette.primary.main,
//             width: 50,
//             height: 50,
//           }}
//         >
//           {icon}
//         </Avatar>

//         <Typography
//           variant="h4"
//           sx={{
//             fontWeight: 700,
//             background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
//             backgroundClip: "text",
//             WebkitBackgroundClip: "text",
//             color: "transparent",
//             fontSize: { xs: "1.5rem", sm: "2rem" },
//           }}
//         >
//           {title}
//         </Typography>
//       </Box>

//       {/* Right */}
//       <Box
//         sx={{
//           display: "flex",
//           gap: 2,
//           width: { xs: "100%", md: "auto" },
//           flexDirection: { xs: "column", sm: "row" },
//         }}
//       >
//         {searchLabel && (
//           <TextField
//             label={searchLabel}
//             size="small"
//             value={searchValue}
//             onChange={onSearchChange}
//             sx={{ width: { xs: "100%", sm: "250px" } }}
//           />
//         )}

//         {primaryBtnLabel && (
//           <Button variant="contained" onClick={onPrimaryClick}>
//             {primaryBtnLabel}
//           </Button>
//         )}

//         {secondaryBtnLabel && (
//           <Button variant="contained" onClick={onSecondaryClick}>
//             {secondaryBtnLabel}
//           </Button>
//         )}
//       </Box>
//     </Paper>
//   )
// }



import React from 'react';
import { 
  Paper, 
  Box, 
  Avatar, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment,
  Stack 
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SearchIcon from '@mui/icons-material/Search';

export const Header = ({
  title,
  icon,
  searchLabel,
  searchValue,
  onSearchChange,
  primaryBtnLabel,
  onPrimaryClick,
  secondaryBtnLabel,
  onSecondaryClick,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: { xs: 2.5, sm: 3 },
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        // Modern "Glass" effect
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(8px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 10px 40px -10px ${alpha(theme.palette.common.black, 0.05)}`,
        
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: { xs: "flex-start", lg: "center" },
        justifyContent: "space-between",
        gap: 3,
      }}
    >
      {/* Decorative Background Element */}
      <Box 
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          zIndex: 0
        }}
      />

      {/* Left Section: Branding & Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, zIndex: 1 }}>
       <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: '18px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 10px 20px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
            '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '18px',
                boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.3)',
            }
          }}
        >
          {React.cloneElement(icon, { 
            sx: { color: '#fff', fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' } 
          })}
        </Box>

        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              letterSpacing: '-0.02em',
              fontSize: { xs: "1.5rem", sm: "1.85rem" },
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            Manage and monitor your {title.toLowerCase()} details
          </Typography>
        </Box>
      </Box>

      {/* Right Section: Actions */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ 
          width: { xs: "100%", lg: "auto" },
          alignItems: "center",
          zIndex: 1 
        }}
      >
        {searchLabel && (
          <TextField
            placeholder={searchLabel}
            size="small"
            value={searchValue}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: { xs: "100%", sm: "280px" },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: alpha(theme.palette.action.hover, 0.05),
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                },
                '&.Mui-focused': {
                    backgroundColor: 'transparent',
                }
              }
            }}
          />
        )}

        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          {secondaryBtnLabel && (
            <Button 
              variant="outlined" 
              onClick={onSecondaryClick}
              fullWidth={false}
              sx={{ 
                borderRadius: 2.5, 
                px: 3, 
                textTransform: 'none', 
                fontWeight: 600,
                borderColor: alpha(theme.palette.divider, 0.2),
                color: theme.palette.text.primary,
                '&:hover': { borderColor: theme.palette.primary.main }
              }}
            >
              {secondaryBtnLabel}
            </Button>
          )}

          {primaryBtnLabel && (
            <Button 
              variant="contained" 
              onClick={onPrimaryClick}
              disableElevation
              sx={{ 
                borderRadius: 2.5, 
                px: 3, 
                textTransform: 'none', 
                fontWeight: 600,
                boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
                '&:hover': {
                    boxShadow: `0 6px 20px rgba(0,0,0,0.23)`,
                }
              }}
            >
              {primaryBtnLabel}
            </Button>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};