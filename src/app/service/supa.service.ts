import { Injectable } from '@angular/core';
import { SupabaseClient, User, createClient,Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SupaService {
   supabase = createClient(environment.supabase.url,environment.supabase.key);

  private supabase_client:SupabaseClient
  private session: Session | null;
  


  constructor(private router:Router) {

    this.supabase_client=createClient(environment.supabase.url,environment.supabase.key)
    this.session = this.loadSession();

  }
  private loadSession(): Session | null {
    const sessionString = localStorage.getItem('supabase.auth.session');
    return sessionString ? JSON.parse(sessionString) : null;
  }
  private saveSession(session: Session): void {
    localStorage.setItem('supabase.auth.session', JSON.stringify(session));
  }

   //Login
   async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      throw new Error(error.message);
    }
  
    // Stockage de la session dans localStorage
    this.session = data.session;
    this.saveSession(this.session);
  
    // Extraction de l'ID de l'utilisateur
    const userId = this.session?.user?.id;
    console.log('User ID:', userId); // Vous pouvez l'utiliser où vous en avez besoin
  
    return data; // Return the data containing user and session
  }
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    console.log('User signed up:', data.user);
    return data; // Retourne les données contenant l'utilisateur et la session
}

  public getUserId(): string | null {
    return this.session?.user?.id || null;  // Retourne l'ID de l'utilisateur ou null si la session n'est pas valide
  }
  //logout
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.session');
  this.session = null; // Clear the session variable
    return { error };
   
  }

 
  public getSession(): Session | null {
    return this.session;
  }

  public async refreshSession(): Promise<void> {
    if (this.session) {
      const { data, error } = await this.supabase.auth.refreshSession();
  
      if (error) {
        throw new Error(error.message);
      }
  
      // Check if data.session is not null before assigning it
      if (data.session) {
        this.session = data.session; // Now TypeScript knows this won't be null
        this.saveSession(this.session);
      } else {
        // Handle the case when the session is null
        console.warn('Session is null after refresh');
        // You may want to handle logout or set this.session to null
        this.session = null; // or however you want to manage the session
      }
    }
  }

  isLoggedIn(): boolean {
    // Check if the token or session data exists (e.g., in localStorage or sessionStorage)
    return !!localStorage.getItem('supabase.auth.token');
  }

  

  async getInstrumentIdsByIndexName(indexName: string): Promise<{ instrument_id: any }[]> {
    const { data, error } = await this.supabase
      .from('indices')
      .select('instrument_id', { count: 'exact', head: false }) // Utilisation de 'head: false' pour renvoyer les données
      .eq('index_name', indexName)
      .order('instrument_id', { ascending: true }) // Optionnel, pour trier les résultats
;  
    if (error) {
      console.error('Erreur de récupération des instrument_id:', error);
      return []; // Retourne un tableau vide en cas d'erreur
    }
  
    // Utiliser Set pour filtrer les valeurs uniques
    const uniqueData = Array.from(new Set(data.map(item => item.instrument_id)))
      .map(instrument_id => ({ instrument_id })); // Reforme l'objet sous { instrument_id: any }
  
    return uniqueData || []; // Assure que 'uniqueData' n'est jamais null
  }
  


  getDates() {
    return this.supabase.from('indices').select('date');
  }

  getMinAndMaxDates() {
    const minDatePromise = this.supabase
      .from('indices')
      .select('date')
      .order('date', { ascending: true })
      .limit(1);
  
    const maxDatePromise = this.supabase
      .from('indices')
      .select('date')
      .order('date', { ascending: false })
      .limit(1);
  
    return Promise.all([minDatePromise, maxDatePromise]);
  }


  async insertData(index: string) {
    const { data, error } = await this.supabase
      .from('parameter')
      .insert([
        {
          selected_index: index, 
        },
      ]);

    if (error) {
      console.error('Erreur d\'insertion:', error);
      return null;
    }
    return data;
  }

  async insertData1(table: string, data: any) {
    const { data: responseData, error } = await this.supabase
      .from('parameter')
      .insert([data]);

    if (error) {
      console.error('Error inserting data:', error);
      return { success: false, error };
    }
    return { success: true, data: responseData };
  }


  async insertWeights(data: any[]) {
    const { data: responseData, error } = await this.supabase
      .from('weights')
      .insert(data);
      
    if (error) {
      console.error('Error inserting data:', error);
      throw error;
    }
    return responseData;
  }



  async saveUploadPrices(data: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('prices') // Remplacez par le nom de votre table
        .insert(data);
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Error uploading data:', err);
      throw err;
    }
  }

  async saveUploadWeights(data: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('weights') // Remplacez par le nom de votre table
        .insert(data);
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Error uploading data:', err);
      throw err;
    }
  }

  
}

   



