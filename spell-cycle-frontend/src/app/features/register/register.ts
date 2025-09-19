import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators, ValidatorFn  } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '@auth/store';
import { ErrorMessage } from 'app/ui/error-message/error-message';

type RoleKey = 'TRAINEE' | 'CREW' | 'TRAINER' | 'MANAGER' | 'PLANNER' | 'SUPERUSER';

interface RoleOption {
  key: RoleKey;
  label: string;
  icon: string;
  tier: 'basic' | 'extra';
}

export function minSelectedRoles(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value ?? []) as unknown as any[];
    return Array.isArray(val) && val.length >= min
      ? null
      : { minSelectedRoles: { required: min, actual: Array.isArray(val) ? val.length : 0 } };
  };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatIconModule, ErrorMessage],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  readonly roleOptions: RoleOption[] = [
    { key: 'TRAINEE',   label: 'Trainee',   icon: 'trainee_icon', tier: 'basic' },
    { key: 'CREW',   label: 'Crew',   icon: 'crew_icon', tier: 'basic' },
    { key: 'TRAINER', label: 'Trainer', icon: 'trainer_icon', tier: 'basic' },
    { key: 'MANAGER',    label: 'Manager',    icon: 'manager_icon', tier: 'basic' },


    { key: 'PLANNER',   label: 'Planner',   icon: 'manager_icon',              tier: 'extra' },
    { key: 'SUPERUSER',     label: 'Superuser',     icon: 'manager_icon',       tier: 'extra' },
  ];

  readonly basicRoles = this.roleOptions.filter(r => r.tier === 'basic').slice(0, 4);
  readonly extraRoles = this.roleOptions.filter(r => r.tier === 'extra');

  isBasicOption = (key: RoleKey): boolean =>
    this.basicRoles.some(r => r.key === key);

  isExtraOption = (key: RoleKey): boolean =>
    this.extraRoles.some(r => r.key === key);

  private fb = inject(NonNullableFormBuilder);

  loading = false;

  form = this.fb.group({
    firstName: this.fb.control('', Validators.required),
    lastName:  this.fb.control('', Validators.required),
    email:     this.fb.control('', [Validators.required, Validators.email]),
    password:  this.fb.control('', Validators.required),

    basicRoles: this.fb.control<string[]>([], {
      validators: [minSelectedRoles(1)],
      updateOn: 'change'
    }),
    extraRoles: this.fb.control<string[]>([], [minSelectedRoles(0)]),
  });

  isSelectedBasic = (key: RoleKey) => this.form.controls.basicRoles.value.includes(key);
  isSelectedExtra = (key: RoleKey) => this.form.controls.extraRoles.value.includes(key);


  toggleRole(key: RoleKey) {
    console.log('toggleRole', key);
    if (this.isBasicOption(key)) {
      const current = this.form.controls.basicRoles.value;
      const next = this.isSelectedBasic(key)
        ? current.filter(k => k !== key)
        : [key];
      this.form.controls.basicRoles.setValue(next);
      this.form.controls.basicRoles.markAsDirty();
      this.form.controls.basicRoles.updateValueAndValidity();
      console.log(this.form.controls.basicRoles.value);
    } else {
      const current = this.form.controls.extraRoles.value;
      const next = this.isSelectedExtra(key)
        ? current.filter(k => k !== key)
        : [...current, key];
      this.form.controls.extraRoles.setValue(next);
      this.form.controls.extraRoles.markAsDirty();
      this.form.controls.extraRoles.updateValueAndValidity(); 
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    console.log('POST body:', payload);
  }
}
