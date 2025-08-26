// Update all university exam components with the navigateAndScrollToTop utility

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { navigateAndScrollToTop } from '../utils/navigation';
import Header from '../components/Header';
import { 
  CheckCircle, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import logo from "../assets/logo.png"
import LogRegModal from '../LogRegModal';
