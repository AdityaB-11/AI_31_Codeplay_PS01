import { Role } from '../types';

interface Avatar {
  image: string;
  alt: string;
  background: string;
}

export interface RoleConfig {
  title: string;
  avatar: Avatar;
  description: string;
  defaultMessage: string;
}

export const roles: Record<Role, RoleConfig> = {
  'Business Support Specialist': {
    title: 'Business Support',
    avatar: {
      image: '/avatars/business-specialist.png',
      alt: 'Business Support Specialist - Professional woman in business attire',
      background: 'from-blue-100 to-blue-200'
    },
    description: 'Helps with business solutions and strategy',
    defaultMessage: 'How can I help optimize your business processes today?'
  },
  'Technical Support Engineer': {
    title: 'Technical Support',
    avatar: {
      image: '/avatars/technical-engineer.png',
      alt: 'Technical Support Engineer - Professional man in business suit',
      background: 'from-slate-100 to-slate-200'
    },
    description: 'Assists with technical issues and implementation',
    defaultMessage: 'How can I assist with your technical implementation or troubleshooting needs?'
  },
  'Customer Support Representative': {
    title: 'Customer Support',
    avatar: {
      image: '/avatars/customer-support.png',
      alt: 'Customer Support Representative - Friendly woman in professional attire',
      background: 'from-blue-100 to-blue-200'
    },
    description: 'Helps with general inquiries and support',
    defaultMessage: 'How may I assist you with NimbusERP today?'
  }
}; 