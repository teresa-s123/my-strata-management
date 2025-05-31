// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations

// Get all maintenance requests with unit and owner information
export async function getMaintenanceRequests() {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      units (
        unit_number,
        unit_type
      ),
      owners (
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching maintenance requests:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Get specific maintenance request by request_id
export async function getMaintenanceRequestById(requestId) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      units (
        unit_number,
        unit_type,
        floor_level,
        square_meters
      ),
      owners (
        first_name,
        last_name,
        email,
        phone,
        emergency_contact_name,
        emergency_contact_phone
      )
    `)
    .eq('request_id', requestId)
    .single()

  if (error) {
    console.error('Error fetching maintenance request:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Create new maintenance request
export async function createMaintenanceRequest(requestData) {
  // Generate unique request ID
  const requestId = 'MR' + Math.floor(10000 + Math.random() * 90000)
  
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert([
      {
        request_id: requestId,
        ...requestData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()

  if (error) {
    console.error('Error creating maintenance request:', error)
    return { data: null, error }
  }

  return { data: data[0], error: null }
}

// Get all units with owner information
export async function getUnitsWithOwners() {
  const { data, error } = await supabase
    .from('units')
    .select(`
      *,
      owners (
        first_name,
        last_name,
        email,
        phone,
        move_in_date
      )
    `)
    .order('unit_number')

  if (error) {
    console.error('Error fetching units:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Get levy payments for a specific unit or all units
export async function getLevyPayments(unitId = null) {
  let query = supabase
    .from('levy_payments')
    .select(`
      *,
      units (
        unit_number,
        unit_type
      ),
      owners (
        first_name,
        last_name,
        email
      )
    `)
    .order('due_date', { ascending: false })

  if (unitId) {
    query = query.eq('unit_id', unitId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching levy payments:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Get building documents
export async function getBuildingDocuments() {
  const { data, error } = await supabase
    .from('building_documents')
    .select('*')
    .order('upload_date', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Get maintenance statistics for dashboard
export async function getMaintenanceStats() {
  const { data: allRequests, error } = await supabase
    .from('maintenance_requests')
    .select('status, priority, created_at')

  if (error) {
    console.error('Error fetching stats:', error)
    return { data: null, error }
  }

  // Calculate statistics
  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    inProgress: allRequests.filter(r => r.status === 'in-progress').length,
    completed: allRequests.filter(r => r.status === 'completed').length,
    emergency: allRequests.filter(r => r.priority === 'emergency').length,
    thisMonth: allRequests.filter(r => {
      const requestDate = new Date(r.created_at)
      const now = new Date()
      return requestDate.getMonth() === now.getMonth() && 
             requestDate.getFullYear() === now.getFullYear()
    }).length
  }

  return { data: stats, error: null }
}