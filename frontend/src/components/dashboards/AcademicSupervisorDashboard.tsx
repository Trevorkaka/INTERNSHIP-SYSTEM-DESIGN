import { useState, useEffect } from 'react'
import { Loader, ClipboardCheck, FileText, BarChart2, Download } from 'lucide-react'
import { evaluationsAPI } from '../../api/services'
import client from '../../api/client'

interface Student {
  id: number
  registration_number: string
  course: string
  year_of_study: number
  user: { id: number; username: string; first_name: string; last_name: string }
}
 
interface Log {
  id: number
  week_number: number
  status: string
  student: number
  submitted_at: string | null
}
 
interface Criteria {
  id: number
  name: string
  max_score: number
}