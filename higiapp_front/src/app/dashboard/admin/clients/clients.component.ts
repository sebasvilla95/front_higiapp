import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  showForm = false;
  isEditing = false;
  editingClient: Client | null = null;
  searchTerm = '';

  // Propiedades calculadas para el template
  get totalClients(): number {
    return this.clients.length;
  }

  get activeClients(): number {
    return this.clients.filter(c => c.status === 'active').length;
  }

  clientForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    // Datos de ejemplo
    this.clients = [
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '+57 300 123 4567',
        address: 'Calle 123 #45-67, Bogotá',
        createdAt: new Date('2024-01-15'),
        status: 'active'
      },
      {
        id: 2,
        name: 'María García',
        email: 'maria.garcia@email.com',
        phone: '+57 310 987 6543',
        address: 'Carrera 78 #90-12, Medellín',
        createdAt: new Date('2024-02-20'),
        status: 'active'
      },
      {
        id: 3,
        name: 'Carlos López',
        email: 'carlos.lopez@email.com',
        phone: '+57 320 555 1234',
        address: 'Avenida 5 #23-45, Cali',
        createdAt: new Date('2024-03-10'),
        status: 'inactive'
      }
    ];
    this.filteredClients = [...this.clients];
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClients = [...this.clients];
      return;
    }

    this.filteredClients = this.clients.filter(client =>
      client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      client.phone.includes(this.searchTerm)
    );
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.editingClient = null;
    this.clientForm.reset({ status: 'active' });
  }

  showEditForm(client: Client): void {
    this.showForm = true;
    this.isEditing = true;
    this.editingClient = client;
    this.clientForm.patchValue(client);
  }

  hideForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingClient = null;
    this.clientForm.reset({ status: 'active' });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const formData = this.clientForm.value;

      if (this.isEditing && this.editingClient) {
        // Editar cliente existente
        const index = this.clients.findIndex(c => c.id === this.editingClient!.id);
        if (index !== -1) {
          this.clients[index] = {
            ...this.clients[index],
            ...formData
          };
        }
      } else {
        // Agregar nuevo cliente
        const newClient: Client = {
          id: Math.max(...this.clients.map(c => c.id)) + 1,
          ...formData,
          createdAt: new Date()
        };
        this.clients.push(newClient);
      }

      this.filteredClients = [...this.clients];
      this.hideForm();
    } else {
      this.markFormGroupTouched();
    }
  }

  deleteClient(client: Client): void {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${client.name}?`)) {
      this.clients = this.clients.filter(c => c.id !== client.id);
      this.filteredClients = [...this.clients];
    }
  }

  toggleClientStatus(client: Client): void {
    client.status = client.status === 'active' ? 'inactive' : 'active';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
