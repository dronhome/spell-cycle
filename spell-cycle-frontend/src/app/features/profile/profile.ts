import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, ɵInternalFormsSharedModule } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

type Sex = 'male' | 'female' | null;
type CountryCode = 'SK' | 'UA' | 'CZ' | 'PL' | 'HU' | 'AT' | 'DE' | 'RO' | 'IT' | 'FR';
type canSeeContacts = 'public' | 'private'
type RoleKey = 'TRAINEE' | 'CREW' | 'TRAINER' | 'MANAGER' | 'PLANNER' | 'SUPERUSER';

interface RoleOption {
  key: RoleKey;
  label: string;
  icon: string;
  tier: 'basic' | 'extra';
}

interface ProfileForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;

  email: FormControl<string>;

  basicRoles: FormControl<string[]>;
  extraRoles: FormControl<string[]>;

  mobileNumber: FormControl<string | null>;

  sex: FormControl<Sex>;
  birthDate: FormControl<string | null>;
  citizenship: FormControl<CountryCode | null>;
  canSeeContacts: FormControl<canSeeContacts>;
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
  selector: 'app-profile',
  imports: [MatIconModule, ɵInternalFormsSharedModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  private route = inject(ActivatedRoute);
  id = signal(this.route.snapshot.paramMap.get('id'));
  edit = signal(false);

  private fb: NonNullableFormBuilder = new FormBuilder().nonNullable;

  readonly sexOptions: ReadonlyArray<{ value: Sex; label: string; url: string }> = [
    { value: 'male', label: 'Male', url: 'icons/mars.png' },
    { value: 'female', label: 'Female', url: 'icons/female.png' }
  ];

  readonly canSeeContactsOptions: ReadonlyArray<{ value: canSeeContacts; label: string }> = [
    { value: 'public', label: 'All' },
    { value: 'private', label: 'Management' },
  ];

  readonly citizenshipOptions: ReadonlyArray<{ code: CountryCode; label: string; url: string }> = [
    { code: 'SK', label: 'Slovakia', url: 'icons/flags/slovakia.png' },
    { code: 'UA', label: 'Ukraine', url: 'icons/flags/ukraine.png' },
    { code: 'CZ', label: 'Czechia', url: 'icons/flags/czechia.png' },
    { code: 'PL', label: 'Poland', url: 'icons/flags/poland.png' },
    { code: 'HU', label: 'Hungary', url: 'icons/flags/hungary.png' },
    { code: 'AT', label: 'Austria', url: 'icons/flags/austria.png' },
    { code: 'DE', label: 'Germany', url: 'icons/flags/germany.png' },
    { code: 'RO', label: 'Romania', url: 'icons/flags/romania.png' },
    { code: 'IT', label: 'Italy', url: 'icons/flags/italy.png' },
    { code: 'FR', label: 'France', url: 'icons/flags/france.png' },
  ];

  readonly rolesOptions: RoleOption[] = [
    { key: 'TRAINEE',   label: 'Trainee',   icon: 'trainee_icon', tier: 'basic' },
    { key: 'CREW',   label: 'Crew',   icon: 'crew_icon', tier: 'basic' },
    { key: 'TRAINER', label: 'Trainer', icon: 'trainer_icon', tier: 'basic' },
    { key: 'MANAGER',    label: 'Manager',    icon: 'manager_icon', tier: 'basic' },


    { key: 'PLANNER',   label: 'Planner',   icon: 'manager_icon',              tier: 'extra' },
    { key: 'SUPERUSER',     label: 'Superuser',     icon: 'manager_icon',       tier: 'extra' },
  ];

  readonly basicRoles = this.rolesOptions.filter(r => r.tier === 'basic').slice(0, 4);
  readonly extraRoles = this.rolesOptions.filter(r => r.tier === 'extra');

  isBasicOption = (key: RoleKey): boolean =>
    this.basicRoles.some(r => r.key === key);

  isExtraOption = (key: RoleKey): boolean =>
    this.extraRoles.some(r => r.key === key);

  toggleEdit() {
    this.edit.update(e => !e);
    if (this.edit()) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id.set(params.get('id'));
    });

    this.form.disable();
    this.form.controls.sex.setValue('male');
  }

  form: FormGroup<ProfileForm> = this.fb.group({
    firstName: this.fb.control('Andrii', { validators: [Validators.required] }),
    lastName: this.fb.control('Kostiushko', { validators: [Validators.required] }),
    email: this.fb.control('dron.home13@gmail.com', { validators: [Validators.required, Validators.email] }),

    basicRoles: this.fb.control<string[]>(['MANAGER'], {
      validators: [minSelectedRoles(1)],
      updateOn: 'change'
    }),
    extraRoles: this.fb.control<string[]>(['SUPERUSER'], [minSelectedRoles(0)]),

    mobileNumber: new FormControl<string | null>('+380934573361'),

    sex: this.fb.control<Sex>(null, { validators: [Validators.required] }),
    birthDate: new FormControl<string | null>('13/12/2004'),
    citizenship: new FormControl<CountryCode | null>('UA'), 
    canSeeContacts: this.fb.control<canSeeContacts>('public', { validators: [Validators.required] }),
  });

  get selectedBasicRoles(): RoleOption[] {
    const selected = this.form.controls.basicRoles.value ?? [];
    return this.rolesOptions.filter(opt => selected.includes(opt.key));
  }

  get selectedExtraRoles(): RoleOption[] {
    const selected = this.form.controls.extraRoles.value ?? [];
    return this.rolesOptions.filter(opt => selected.includes(opt.key));
  }

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
    console.log(this.form.getRawValue());
  }

}

