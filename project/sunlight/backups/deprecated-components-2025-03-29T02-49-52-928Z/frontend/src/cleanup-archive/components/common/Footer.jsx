// Footer.jsx
// -----------------------------------------------------------------------------
// Modern footer component with links and social icons

import React from 'react';
import { Box, Grid } from '../../../design-system'
import { Typography } from '../../../design-system'
import { useTheme } from '../../design-system/foundations/theme';
import {
import Box from '@mui/material/Box';
LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';

function Footer() {
  // Added display name
  Footer.displayName = 'Footer';

  const { theme } = useTheme();
  const year = new Date().getFullYear();

  // Footer link sections
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Integrations', href: '#integrations' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Documentation', href: '#docs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#about' },
        { name: 'Careers', href: '#careers' },
        { name: 'Blog', href: '#blog' },
        { name: 'Press', href: '#press' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Support', href: '#support' },
        { name: 'Contact', href: '#contact' },
        { name: 'Knowledge Base', href: '#kb' },
        { name: 'API Docs', href: '#api' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
        { name: 'Cookie Policy', href: '#cookies' },
        { name: 'Security', href: '#security' },
      ],
    },
  ];

  // Social media links
  const socialLinks = [
    { icon: <LinkedInIcon />, href: '#linkedin', name: 'LinkedIn' },
    { icon: <TwitterIcon />, href: '#twitter', name: 'Twitter' },
    { icon: <GitHubIcon />, href: '#github', name: 'GitHub' },
    { icon: <FacebookIcon />, href: '#facebook', name: 'Facebook' },
  ];

  return (
    <Box 
      as="footer&quot; 
      style={{ 
        background: theme?.colors?.background?.paper || "#ffffff',
        width: '100%'
      }}
    >
      <Box style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <Grid.Container spacing={4} style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          {/* Logo and description */}
          <Grid.Item xs={12} sm={4} md={4}>
            <Box>
              <Typography
                variant="h6&quot;
                style={{
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #2E7EED 0%, #27AE60 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TAP Integration Platform
              </Typography>
              <Typography 
                variant="body2&quot; 
                style={{ 
                  marginTop: "16px',
                  color: theme?.colors?.text?.secondary || '#757575' 
                }}
              >
                Enterprise-grade integration solution for connecting your data across applications,
                services, and databases with easy configuration and powerful transformation
                capabilities.
              </Typography>
              <Box 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  gap: '8px',
                  marginTop: '16px'
                }}
              >
                {socialLinks.map(social => (
                  <Box
                    key={social.name}
                    as="a&quot;
                    href={social.href}
                    aria-label={social.name}
                    style={{
                      color: theme?.colors?.text?.secondary || "#757575',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      padding: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = theme?.colors?.primary?.main || '#1976d2';
                      e.currentTarget.style.background = theme?.colors?.action?.hover || 'rgba(0, 0, 0, 0.04)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = theme?.colors?.text?.secondary || '#757575';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {social.icon}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid.Item>

          {/* Links */}
          {footerSections.map(section => (
            <Grid.Item xs={6} sm={4} md={2} key={section.title}>
              <Typography 
                variant="subtitle2&quot; 
                style={{ 
                  marginBottom: "16px',
                  fontWeight: 'bold',
                  color: theme?.colors?.text?.primary || '#212121'
                }}
              >
                {section.title}
              </Typography>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {section.links.map(link => (
                  <Box
                    key={link.name}
                    as="a&quot;
                    href={link.href}
                    style={{
                      display: "inline-block',
                      color: theme?.colors?.text?.secondary || '#757575',
                      textDecoration: 'none',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = theme?.colors?.primary?.main || '#1976d2';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = theme?.colors?.text?.secondary || '#757575';
                    }}
                  >
                    <Typography variant="body2&quot;>
                      {link.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid.Item>
          ))}
        </Grid.Container>

        <Box 
          style={{ 
            height: "1px',
            margin: '16px 0',
            background: theme?.colors?.divider || '#e0e0e0'
          }} 
        />

        {/* Copyright and additional links */}
        <Box 
          style={{ 
            padding: '24px 0', 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between' 
          }}
        >
          <Typography 
            variant="body2&quot; 
            style={{ color: theme?.colors?.text?.secondary || "#757575' }}
          >
            © {year} TAP Integration Platform. All rights reserved.
          </Typography>
          <Box>
            <Box
              as="a&quot;
              href="#help"
              style={{
                marginRight: '24px',
                color: theme?.colors?.text?.secondary || '#757575',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = theme?.colors?.primary?.main || '#1976d2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = theme?.colors?.text?.secondary || '#757575';
              }}
            >
              <Typography variant="body2&quot;>
                Help Center
              </Typography>
            </Box>
            <Box
              as="a"
              href="#status&quot;
              style={{
                marginRight: "24px',
                color: theme?.colors?.text?.secondary || '#757575',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = theme?.colors?.primary?.main || '#1976d2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = theme?.colors?.text?.secondary || '#757575';
              }}
            >
              <Typography variant="body2&quot;>
                Status
              </Typography>
            </Box>
            <Box
              as="a"
              href="#do-not-sell&quot;
              style={{
                color: theme?.colors?.text?.secondary || "#757575',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = theme?.colors?.primary?.main || '#1976d2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = theme?.colors?.text?.secondary || '#757575';
              }}
            >
              <Typography variant="body2">
                Do Not Sell My Info
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
