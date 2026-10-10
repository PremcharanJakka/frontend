import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

import {
  Users,
  ShieldCheck,
  Landmark,
  TrendingUp,
  Home,
  FileText,
  Fingerprint,
  CreditCard,
  HeartPulse,
  KeyRound,
  AlertTriangle,
  Smartphone,
  CalendarDays,
  Heart,
  GitBranch,
  Plus,
  Trash2,
  Save,
  Lock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Shield,
  WalletCards,
  FolderLock,
  UserRound,
  Activity,
  Clock3,
  Search,
  ArrowUpRight,
  FileCheck2,
  type LucideIcon,
} from 'lucide-react';

/* ============================================================
   TYPES
============================================================ */

type Contact = {
  name: string;
  relation: string;
  phone: string;
  email: string;
  address: string;
};

type Policy = {
  name: string;
  provider: string;
  policy_number: string;
  coverage: string;
  premium: string;
};

type Bank = {
  bank_name: string;
  account_type: string;
  account_number: string;
  branch: string;
};

type Investment = {
  name: string;
  type: string;
  amount: string;
};

type Property = {
  name: string;
  type: string;
  location: string;
  value: string;
};

type Document = {
  name: string;
  location: string;
  notes: string;
};

type Identity = {
  type: string;
  number: string;
  notes: string;
};

type Liability = {
  name: string;
  amount: string;
  due_date: string;
  notes: string;
};

type DateItem = {
  title: string;
  date: string;
  notes: string;
};

type DigitalAccount = {
  platform: string;
  username: string;
  notes: string;
};

type FamilyTreeItem = {
  name: string;
  relation: string;
  notes: string;
};

type WillInfo = {
  registered: boolean;
  location: string;
  registration_number: string;
  executor_name: string;
  executor_contact: string;
  witnesses: string;
  notes: string;
};

type PowerOfAttorney = {
  type: string;
  holder_name: string;
  holder_contact: string;
  registration_date: string;
  notes: string;
};

type EmergencyInfo = {
  blood_group: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
  doctor_name: string;
  doctor_phone: string;
  hospital: string;
  emergency_contact: string;
  notes: string;
};

type FuneralWishes = {
  preferences: string;
  burial_cremation: string;
  location: string;
  fund_allocated: string;
  notes: string;
};

type FamilyInfo = {
  id: string;
  user_id: string;

  emergency_contacts: Contact[] | string | null;
  insurance_policies: Policy[] | string | null;
  bank_details: Bank[] | string | null;
  investment_details: Investment[] | string | null;
  property_info: Property[] | string | null;
  documents: Document[] | string | null;
  identity_details: Identity[] | string | null;
  liabilities: Liability[] | string | null;

  will_info: WillInfo | string | null;
  power_of_attorney: PowerOfAttorney | string | null;
  emergency_info: EmergencyInfo | string | null;

  digital_accounts: DigitalAccount[] | string | null;
  important_dates: DateItem[] | string | null;
  funeral_wishes: FuneralWishes | string | null;
  family_tree: FamilyTreeItem[] | string | null;
};

/* ============================================================
   EMPTY VALUES
============================================================ */

const EMPTY_CONTACT: Contact = {
  name: '',
  relation: '',
  phone: '',
  email: '',
  address: '',
};

const EMPTY_POLICY: Policy = {
  name: '',
  provider: '',
  policy_number: '',
  coverage: '',
  premium: '',
};

const EMPTY_BANK: Bank = {
  bank_name: '',
  account_type: '',
  account_number: '',
  branch: '',
};

const EMPTY_INVESTMENT: Investment = {
  name: '',
  type: '',
  amount: '',
};

const EMPTY_PROPERTY: Property = {
  name: '',
  type: '',
  location: '',
  value: '',
};

const EMPTY_DOCUMENT: Document = {
  name: '',
  location: '',
  notes: '',
};

const EMPTY_IDENTITY: Identity = {
  type: '',
  number: '',
  notes: '',
};

const EMPTY_LIABILITY: Liability = {
  name: '',
  amount: '',
  due_date: '',
  notes: '',
};

const EMPTY_DATE: DateItem = {
  title: '',
  date: '',
  notes: '',
};

const EMPTY_DIGITAL: DigitalAccount = {
  platform: '',
  username: '',
  notes: '',
};

const EMPTY_FAMILY_TREE: FamilyTreeItem = {
  name: '',
  relation: '',
  notes: '',
};

const EMPTY_WILL: WillInfo = {
  registered: false,
  location: '',
  registration_number: '',
  executor_name: '',
  executor_contact: '',
  witnesses: '',
  notes: '',
};

const EMPTY_POA: PowerOfAttorney = {
  type: '',
  holder_name: '',
  holder_contact: '',
  registration_date: '',
  notes: '',
};

const EMPTY_EMERGENCY: EmergencyInfo = {
  blood_group: '',
  allergies: '',
  medications: '',
  medical_conditions: '',
  doctor_name: '',
  doctor_phone: '',
  hospital: '',
  emergency_contact: '',
  notes: '',
};

const EMPTY_FUNERAL: FuneralWishes = {
  preferences: '',
  burial_cremation: '',
  location: '',
  fund_allocated: '',
  notes: '',
};

/* ============================================================
   HELPERS
============================================================ */

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? (parsed as T[])
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function toObject<T extends object>(
  value: unknown,
  fallback: T
): T {
  if (!value) {
    return { ...fallback };
  }

  if (
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as T;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);

      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return parsed as T;
      }
    } catch {
      return { ...fallback };
    }
  }

  return { ...fallback };
}

/*
 * IMPORTANT:
 * Empty boolean false must NOT count as content.
 *
 * This fixes:
 *
 * EMPTY WILL
 * registered: false
 *
 * from being counted as completed.
 */
function hasContent(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.values(value).some((item) => {
      if (
        item === null ||
        item === undefined
      ) {
        return false;
      }

      if (typeof item === 'boolean') {
        return item === true;
      }

      if (typeof item === 'number') {
        return item !== 0;
      }

      return String(item).trim() !== '';
    });
  }

  if (typeof value === 'boolean') {
    return value === true;
  }

  return String(value).trim() !== '';
}

/* ============================================================
   TABS
============================================================ */

const TABS: {
  id: string;
  label: string;
  short: string;
  icon: LucideIcon;
  description: string;
}[] = [
  {
    id: 'contacts',
    label: 'Emergency Contacts',
    short: 'Contacts',
    icon: Users,
    description: 'People to contact during emergencies',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    short: 'Insurance',
    icon: ShieldCheck,
    description: 'Policies, coverage and premiums',
  },
  {
    id: 'bank',
    label: 'Bank Details',
    short: 'Banking',
    icon: Landmark,
    description: 'Important banking information',
  },
  {
    id: 'investments',
    label: 'Investments',
    short: 'Investments',
    icon: TrendingUp,
    description: 'Investment accounts and holdings',
  },
  {
    id: 'property',
    label: 'Property',
    short: 'Property',
    icon: Home,
    description: 'Homes, land and other assets',
  },
  {
    id: 'documents',
    label: 'Documents',
    short: 'Documents',
    icon: FileText,
    description: 'Important document locations',
  },
  {
    id: 'identity',
    label: 'Identity',
    short: 'Identity',
    icon: Fingerprint,
    description: 'Identity and identification details',
  },
  {
    id: 'liabilities',
    label: 'Liabilities',
    short: 'Liabilities',
    icon: CreditCard,
    description: 'Loans, dues and financial obligations',
  },
  {
    id: 'will',
    label: 'Will',
    short: 'Will',
    icon: FileCheck2,
    description: 'Will and executor information',
  },
  {
    id: 'poa',
    label: 'Power of Attorney',
    short: 'POA',
    icon: KeyRound,
    description: 'Authorized representatives',
  },
  {
    id: 'emergency',
    label: 'Emergency Info',
    short: 'Emergency',
    icon: HeartPulse,
    description: 'Critical medical information',
  },
  {
    id: 'digital',
    label: 'Digital Accounts',
    short: 'Digital',
    icon: Smartphone,
    description: 'Digital accounts and services',
  },
  {
    id: 'dates',
    label: 'Important Dates',
    short: 'Dates',
    icon: CalendarDays,
    description: 'Dates your family should remember',
  },
  {
    id: 'funeral',
    label: 'Funeral Wishes',
    short: 'Wishes',
    icon: Heart,
    description: 'Personal and financial preferences',
  },
  {
    id: 'tree',
    label: 'Family Tree',
    short: 'Family',
    icon: GitBranch,
    description: 'Family members and relationships',
  },
];

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  textarea = false,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  const className =
    'w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-base-color placeholder:text-muted/60 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10';

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted">
        {label}
      </label>

      {textarea ? (
        <textarea
          value={value ?? ''}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          rows={4}
          className={`${className} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  icon: Icon,
  title,
  description,
  count,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon
            size={20}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <h2 className="text-base font-semibold text-base-color">
            {title}
          </h2>

          <p className="mt-1 text-xs text-muted">
            {description}
          </p>
        </div>
      </div>

      {typeof count === 'number' && (
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
          {count}{' '}
          {count === 1 ? 'item' : 'items'}
        </span>
      )}
    </div>
  );
}

/* ============================================================
   LIST SECTION
============================================================ */

function ListSection<T extends Record<string, any>>({
  title,
  description,
  icon,
  items,
  setItems,
  empty,
  fields,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  empty: T;
  fields: {
    key: keyof T;
    label: string;
    placeholder?: string;
    type?: string;
    textarea?: boolean;
  }[];
}) {
  function addItem() {
    setItems((current) => [
      ...current,
      { ...empty },
    ]);
  }

  function updateItem(
    index: number,
    key: keyof T,
    value: string
  ) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: value,
            }
          : item
      )
    );
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <SectionHeader
        icon={icon}
        title={title}
        description={description}
        count={items.length}
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-2/50 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Plus size={20} />
          </div>

          <p className="text-sm font-medium text-base-color">
            Nothing added yet
          </p>

          <p className="mt-1 text-xs text-muted">
            Add your first entry below.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-surface-2/40 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
                    {index + 1}
                  </span>

                  <span className="text-xs font-medium text-muted">
                    Entry {index + 1}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeItem(index)
                  }
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <Field
                    key={String(field.key)}
                    label={field.label}
                    value={item[field.key]}
                    placeholder={
                      field.placeholder
                    }
                    type={field.type}
                    textarea={
                      field.textarea
                    }
                    onChange={(value) =>
                      updateItem(
                        index,
                        field.key,
                        value
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addItem}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/10"
      >
        <Plus size={16} />
        Add another entry
      </button>
    </div>
  );
}

/* ============================================================
   OBJECT SECTION
============================================================ */

function ObjectSection({
  title,
  description,
  icon,
  data,
  setData,
  fields,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  data: Record<string, any>;
  setData: Dispatch<SetStateAction<any>>;
  fields: {
    key: string;
    label: string;
    placeholder?: string;
    type?: string;
    textarea?: boolean;
  }[];
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <SectionHeader
        icon={icon}
        title={title}
        description={description}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            value={data[field.key] ?? ''}
            placeholder={
              field.placeholder
            }
            type={field.type}
            textarea={field.textarea}
            onChange={(value) =>
              setData((current: any) => ({
                ...current,
                [field.key]: value,
              }))
            }
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export function FamilyGuidancePage() {
  const { user } = useAuth();

  const [recordId, setRecordId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState('contacts');

  const [search, setSearch] =
    useState('');

  const [savedMessage, setSavedMessage] =
    useState(false);

  const [contacts, setContacts] =
    useState<Contact[]>([]);

  const [policies, setPolicies] =
    useState<Policy[]>([]);

  const [banks, setBanks] =
    useState<Bank[]>([]);

  const [investments, setInvestments] =
    useState<Investment[]>([]);

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [identities, setIdentities] =
    useState<Identity[]>([]);

  const [liabilities, setLiabilities] =
    useState<Liability[]>([]);

  const [willInfo, setWillInfo] =
    useState<WillInfo>({
      ...EMPTY_WILL,
    });

  const [poa, setPoa] =
    useState<PowerOfAttorney>({
      ...EMPTY_POA,
    });

  const [emergencyInfo, setEmergencyInfo] =
    useState<EmergencyInfo>({
      ...EMPTY_EMERGENCY,
    });

  const [digitalAccounts, setDigitalAccounts] =
    useState<DigitalAccount[]>([]);

  const [importantDates, setImportantDates] =
    useState<DateItem[]>([]);

  const [funeralWishes, setFuneralWishes] =
    useState<FuneralWishes>({
      ...EMPTY_FUNERAL,
    });

  const [familyTree, setFamilyTree] =
    useState<FamilyTreeItem[]>([]);

  /* ==========================================================
     LOAD
  ========================================================== */

  useEffect(() => {
    async function loadFamilyInfo() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const result = await api
          .from('family_info')
          .select('*')
          .maybeSingle();

        if (result.error) {
          console.error(
            'Family Guidance load error:',
            result.error
          );
          return;
        }

        if (result.data) {
          const data =
            result.data as FamilyInfo;

          setRecordId(data.id);

          setContacts(
            toArray<Contact>(
              data.emergency_contacts
            )
          );

          setPolicies(
            toArray<Policy>(
              data.insurance_policies
            )
          );

          setBanks(
            toArray<Bank>(
              data.bank_details
            )
          );

          setInvestments(
            toArray<Investment>(
              data.investment_details
            )
          );

          setProperties(
            toArray<Property>(
              data.property_info
            )
          );

          setDocuments(
            toArray<Document>(
              data.documents
            )
          );

          setIdentities(
            toArray<Identity>(
              data.identity_details
            )
          );

          setLiabilities(
            toArray<Liability>(
              data.liabilities
            )
          );

          setWillInfo(
            toObject(
              data.will_info,
              EMPTY_WILL
            )
          );

          setPoa(
            toObject(
              data.power_of_attorney,
              EMPTY_POA
            )
          );

          setEmergencyInfo(
            toObject(
              data.emergency_info,
              EMPTY_EMERGENCY
            )
          );

          setDigitalAccounts(
            toArray<DigitalAccount>(
              data.digital_accounts
            )
          );

          setImportantDates(
            toArray<DateItem>(
              data.important_dates
            )
          );

          setFuneralWishes(
            toObject(
              data.funeral_wishes,
              EMPTY_FUNERAL
            )
          );

          setFamilyTree(
            toArray<FamilyTreeItem>(
              data.family_tree
            )
          );
        }
      } catch (error) {
        console.error(
          'Family Guidance load exception:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadFamilyInfo();
  }, [user]);

  /* ==========================================================
     SAVE
  ========================================================== */

  async function handleSave() {
    if (!user) {
      alert('Please login again.');
      return;
    }

    setSaving(true);
    setSavedMessage(false);

    try {
      const payload = {
        emergency_contacts: contacts,
        insurance_policies: policies,
        bank_details: banks,
        investment_details: investments,
        property_info: properties,
        documents,
        identity_details: identities,
        liabilities,
        will_info: willInfo,
        power_of_attorney: poa,
        emergency_info: emergencyInfo,
        digital_accounts: digitalAccounts,
        important_dates: importantDates,
        funeral_wishes: funeralWishes,
        family_tree: familyTree,
      };

      let result;

      if (recordId) {
        result = await api
          .from('family_info')
          .update(payload)
          .eq('id', recordId)
          .single();
      } else {
        result = await api
          .from('family_info')
          .insert(payload)
          .single();
      }

      if (result.error) {
        alert(
          `Failed to save Family Guidance:\n${result.error.message}`
        );
        return;
      }

      /*
       * Update screen immediately using the actual
       * record returned by Spring Boot.
       */
      if (result.data) {
        const saved =
          result.data as FamilyInfo;

        setRecordId(saved.id);

        setContacts(
          toArray<Contact>(
            saved.emergency_contacts
          )
        );

        setPolicies(
          toArray<Policy>(
            saved.insurance_policies
          )
        );

        setBanks(
          toArray<Bank>(
            saved.bank_details
          )
        );

        setInvestments(
          toArray<Investment>(
            saved.investment_details
          )
        );

        setProperties(
          toArray<Property>(
            saved.property_info
          )
        );

        setDocuments(
          toArray<Document>(
            saved.documents
          )
        );

        setIdentities(
          toArray<Identity>(
            saved.identity_details
          )
        );

        setLiabilities(
          toArray<Liability>(
            saved.liabilities
          )
        );

        setWillInfo(
          toObject(
            saved.will_info,
            EMPTY_WILL
          )
        );

        setPoa(
          toObject(
            saved.power_of_attorney,
            EMPTY_POA
          )
        );

        setEmergencyInfo(
          toObject(
            saved.emergency_info,
            EMPTY_EMERGENCY
          )
        );

        setDigitalAccounts(
          toArray<DigitalAccount>(
            saved.digital_accounts
          )
        );

        setImportantDates(
          toArray<DateItem>(
            saved.important_dates
          )
        );

        setFuneralWishes(
          toObject(
            saved.funeral_wishes,
            EMPTY_FUNERAL
          )
        );

        setFamilyTree(
          toArray<FamilyTreeItem>(
            saved.family_tree
          )
        );
      }

      setSavedMessage(true);

      window.setTimeout(() => {
        setSavedMessage(false);
      }, 3500);

    } catch (error) {
      console.error(
        'Family Guidance save exception:',
        error
      );

      alert(
        `Failed to save Family Guidance:\n${
          error instanceof Error
            ? error.message
            : 'Something went wrong'
        }`
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     COMPLETION
  ========================================================== */

  const sectionStatus = useMemo(
    () => ({
      contacts: contacts.length > 0,
      insurance: policies.length > 0,
      bank: banks.length > 0,
      investments: investments.length > 0,
      property: properties.length > 0,
      documents: documents.length > 0,
      identity: identities.length > 0,
      liabilities: liabilities.length > 0,

      /*
       * These now correctly return false
       * when only default empty values exist.
       */
      will: hasContent(willInfo),
      poa: hasContent(poa),
      emergency: hasContent(emergencyInfo),

      digital: digitalAccounts.length > 0,
      dates: importantDates.length > 0,
      funeral: hasContent(funeralWishes),
      tree: familyTree.length > 0,
    }),
    [
      contacts,
      policies,
      banks,
      investments,
      properties,
      documents,
      identities,
      liabilities,
      willInfo,
      poa,
      emergencyInfo,
      digitalAccounts,
      importantDates,
      funeralWishes,
      familyTree,
    ]
  );

  const completedSections =
    Object.values(sectionStatus).filter(
      Boolean
    ).length;

  const progress = Math.round(
    (completedSections /
      TABS.length) *
      100
  );

  const filteredTabs =
    TABS.filter((tab) =>
      tab.label
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const activeDefinition =
    TABS.find(
      (tab) =>
        tab.id === activeTab
    ) ?? TABS[0];

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users size={25} />
          </div>

          <p className="mt-4 text-sm font-medium text-base-color">
            Loading Family Guidance
          </p>

          <p className="mt-1 text-xs text-muted">
            Preparing your secure family information...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[28px] border border-border bg-surface p-6 shadow-sm md:p-8">

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <Users
                  size={27}
                  strokeWidth={1.7}
                />
              </div>

              <div>

                <div className="mb-2 flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    <Sparkles size={12} />
                    FAMILY VAULT
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                    <Lock size={11} />
                    Private & Secure
                  </span>

                </div>

                <h1 className="text-2xl font-bold tracking-tight text-base-color md:text-3xl">
                  My Family Guidance
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Keep your family's important financial,
                  legal, emergency and personal information
                  organized in one secure place.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              {savedMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2 text-xs font-medium text-green-600">
                  <CheckCircle2 size={15} />
                  Saved successfully
                </div>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handleSave}
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="mt-7 rounded-2xl border border-border bg-surface-2/50 p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Activity size={17} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-base-color">
                    Family information completeness
                  </p>

                  <p className="text-[11px] text-muted">
                    {completedSections} of{' '}
                    {TABS.length} sections completed
                  </p>
                </div>

              </div>

              <span className="text-sm font-bold text-primary">
                {progress}%
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          QUICK STATS
      ====================================================== */}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <UserRound size={17} />
            </div>

            <ArrowUpRight
              size={14}
              className="text-muted"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-base-color">
            {contacts.length}
          </p>

          <p className="text-xs text-muted">
            Emergency contacts
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <Shield size={17} />
            </div>

            <ArrowUpRight
              size={14}
              className="text-muted"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-base-color">
            {policies.length}
          </p>

          <p className="text-xs text-muted">
            Insurance policies
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <WalletCards size={17} />
            </div>

            <ArrowUpRight
              size={14}
              className="text-muted"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-base-color">
            {investments.length}
          </p>

          <p className="text-xs text-muted">
            Investments
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <FolderLock size={17} />
            </div>

            <ArrowUpRight
              size={14}
              className="text-muted"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-base-color">
            {documents.length}
          </p>

          <p className="text-xs text-muted">
            Documents
          </p>
        </div>

      </div>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">

        {/* SIDEBAR */}

        <aside className="lg:sticky lg:top-5 lg:self-start">

          <div className="rounded-3xl border border-border bg-surface p-3 shadow-sm">

            <div className="mb-3 px-2 pt-1">

              <div className="relative">

                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search sections..."
                  className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-9 pr-3 text-xs text-base-color outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />

              </div>

            </div>

            <div className="space-y-1">

              {filteredTabs.map((tab) => {
                const Icon = tab.icon;

                const active =
                  activeTab === tab.id;

                const completed =
                  sectionStatus[
                    tab.id as keyof typeof sectionStatus
                  ];

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/15'
                        : 'text-muted hover:bg-surface-2 hover:text-base-color'
                    }`}
                  >

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? 'bg-white/15'
                          : 'bg-surface-2 group-hover:bg-primary/10 group-hover:text-primary'
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {tab.short}
                      </p>
                    </div>

                    {completed ? (
                      <CheckCircle2
                        size={15}
                        className={
                          active
                            ? 'text-white'
                            : 'text-green-500'
                        }
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className={
                          active
                            ? 'text-white/70'
                            : 'text-muted/60'
                        }
                      />
                    )}

                  </button>
                );
              })}

            </div>

            <div className="mt-4 rounded-2xl bg-primary/5 p-4">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-base-color">
                    Private information
                  </p>

                  <p className="text-[10px] text-muted">
                    Protected by your account
                  </p>
                </div>

              </div>

            </div>

          </div>

        </aside>

        {/* CONTENT */}

        <main className="min-w-0">

          <div className="mb-4 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <activeDefinition.icon
                  size={19}
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-base-color">
                  {activeDefinition.label}
                </h2>

                <p className="text-xs text-muted">
                  {activeDefinition.description}
                </p>
              </div>

            </div>

            <div className="hidden items-center gap-2 text-[11px] text-muted sm:flex">
              <Clock3 size={13} />
              Auto-loaded from your account
            </div>

          </div>

          {/* CONTACTS */}

          {activeTab === 'contacts' && (
            <ListSection
              title="Emergency Contacts"
              description="People your family can contact when immediate assistance is needed."
              icon={Users}
              items={contacts}
              setItems={setContacts}
              empty={EMPTY_CONTACT}
              fields={[
                {
                  key: 'name',
                  label: 'Full Name',
                  placeholder: 'e.g. Rahul Kumar',
                },
                {
                  key: 'relation',
                  label: 'Relationship',
                  placeholder: 'e.g. Brother',
                },
                {
                  key: 'phone',
                  label: 'Phone Number',
                  placeholder: '+91 XXXXX XXXXX',
                  type: 'tel',
                },
                {
                  key: 'email',
                  label: 'Email',
                  placeholder: 'name@example.com',
                  type: 'email',
                },
                {
                  key: 'address',
                  label: 'Address',
                  placeholder: 'Complete address',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* INSURANCE */}

          {activeTab === 'insurance' && (
            <ListSection
              title="Insurance Policies"
              description="Record policies so your family knows what coverage exists."
              icon={ShieldCheck}
              items={policies}
              setItems={setPolicies}
              empty={EMPTY_POLICY}
              fields={[
                {
                  key: 'name',
                  label: 'Policy Name',
                  placeholder: 'e.g. Health Insurance',
                },
                {
                  key: 'provider',
                  label: 'Provider',
                  placeholder: 'Insurance company',
                },
                {
                  key: 'policy_number',
                  label: 'Policy Number',
                  placeholder: 'Policy ID',
                },
                {
                  key: 'coverage',
                  label: 'Coverage Amount',
                  placeholder: 'e.g. ₹10,00,000',
                },
                {
                  key: 'premium',
                  label: 'Premium',
                  placeholder: 'e.g. ₹25,000/year',
                },
              ]}
            />
          )}

          {/* BANK */}

          {activeTab === 'bank' && (
            <ListSection
              title="Bank Details"
              description="Store important banking references for your family's financial continuity."
              icon={Landmark}
              items={banks}
              setItems={setBanks}
              empty={EMPTY_BANK}
              fields={[
                {
                  key: 'bank_name',
                  label: 'Bank Name',
                  placeholder: 'e.g. State Bank of India',
                },
                {
                  key: 'account_type',
                  label: 'Account Type',
                  placeholder: 'Savings / Current / FD',
                },
                {
                  key: 'account_number',
                  label: 'Account Number',
                  placeholder: 'Account number',
                },
                {
                  key: 'branch',
                  label: 'Branch',
                  placeholder: 'Branch name',
                },
              ]}
            />
          )}

          {/* INVESTMENTS */}

          {activeTab === 'investments' && (
            <ListSection
              title="Investment Details"
              description="Keep a record of investments and their approximate values."
              icon={TrendingUp}
              items={investments}
              setItems={setInvestments}
              empty={EMPTY_INVESTMENT}
              fields={[
                {
                  key: 'name',
                  label: 'Investment Name',
                  placeholder: 'e.g. SBI Mutual Fund',
                },
                {
                  key: 'type',
                  label: 'Investment Type',
                  placeholder: 'Mutual Fund / FD / Stocks',
                },
                {
                  key: 'amount',
                  label: 'Amount / Value',
                  placeholder: 'e.g. ₹2,50,000',
                },
              ]}
            />
          )}

          {/* PROPERTY */}

          {activeTab === 'property' && (
            <ListSection
              title="Property Information"
              description="Record property ownership, locations and approximate values."
              icon={Home}
              items={properties}
              setItems={setProperties}
              empty={EMPTY_PROPERTY}
              fields={[
                {
                  key: 'name',
                  label: 'Property Name',
                  placeholder: 'e.g. Family Home',
                },
                {
                  key: 'type',
                  label: 'Property Type',
                  placeholder: 'House / Land / Apartment',
                },
                {
                  key: 'location',
                  label: 'Location',
                  placeholder: 'City / Area',
                },
                {
                  key: 'value',
                  label: 'Approximate Value',
                  placeholder: 'e.g. ₹80,00,000',
                },
              ]}
            />
          )}

          {/* DOCUMENTS */}

          {activeTab === 'documents' && (
            <ListSection
              title="Important Documents"
              description="Record where important physical or digital documents are stored."
              icon={FileText}
              items={documents}
              setItems={setDocuments}
              empty={EMPTY_DOCUMENT}
              fields={[
                {
                  key: 'name',
                  label: 'Document Name',
                  placeholder: 'e.g. Property Deed',
                },
                {
                  key: 'location',
                  label: 'Storage Location',
                  placeholder: 'Locker / File / Drive',
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  placeholder: 'Additional information',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* IDENTITY */}

          {activeTab === 'identity' && (
            <ListSection
              title="Identity Details"
              description="Keep references to important identity documents."
              icon={Fingerprint}
              items={identities}
              setItems={setIdentities}
              empty={EMPTY_IDENTITY}
              fields={[
                {
                  key: 'type',
                  label: 'Identity Type',
                  placeholder: 'Aadhaar / PAN / Passport',
                },
                {
                  key: 'number',
                  label: 'Document Number',
                  placeholder: 'Document number',
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  placeholder: 'Additional information',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* LIABILITIES */}

          {activeTab === 'liabilities' && (
            <ListSection
              title="Liabilities"
              description="Record loans, outstanding dues and other financial obligations."
              icon={CreditCard}
              items={liabilities}
              setItems={setLiabilities}
              empty={EMPTY_LIABILITY}
              fields={[
                {
                  key: 'name',
                  label: 'Liability / Loan',
                  placeholder: 'e.g. Home Loan',
                },
                {
                  key: 'amount',
                  label: 'Outstanding Amount',
                  placeholder: 'e.g. ₹15,00,000',
                },
                {
                  key: 'due_date',
                  label: 'Due Date',
                  type: 'date',
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  placeholder: 'EMI or other details',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* WILL */}

          {activeTab === 'will' && (
            <ObjectSection
              title="Will Information"
              description="Keep essential references about your will and executor."
              icon={FileCheck2}
              data={willInfo}
              setData={setWillInfo}
              fields={[
                {
                  key: 'location',
                  label: 'Will Location',
                  placeholder: 'Where is the original stored?',
                },
                {
                  key: 'registration_number',
                  label: 'Registration Number',
                  placeholder: 'Registration number',
                },
                {
                  key: 'executor_name',
                  label: 'Executor Name',
                  placeholder: 'Executor full name',
                },
                {
                  key: 'executor_contact',
                  label: 'Executor Contact',
                  placeholder: 'Phone / email',
                },
                {
                  key: 'witnesses',
                  label: 'Witnesses',
                  placeholder: 'Witness details',
                  textarea: true,
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  placeholder: 'Additional will information',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* POA */}

          {activeTab === 'poa' && (
            <ObjectSection
              title="Power of Attorney"
              description="Record the person authorized to act on your behalf."
              icon={KeyRound}
              data={poa}
              setData={setPoa}
              fields={[
                {
                  key: 'type',
                  label: 'POA Type',
                  placeholder: 'General / Special / Financial',
                },
                {
                  key: 'holder_name',
                  label: 'Holder Name',
                  placeholder: 'Authorized person',
                },
                {
                  key: 'holder_contact',
                  label: 'Holder Contact',
                  placeholder: 'Phone / email',
                },
                {
                  key: 'registration_date',
                  label: 'Registration Date',
                  type: 'date',
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  placeholder: 'Additional information',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* EMERGENCY */}

          {activeTab === 'emergency' && (
            <ObjectSection
              title="Emergency Information"
              description="Critical information that family members may need."
              icon={HeartPulse}
              data={emergencyInfo}
              setData={setEmergencyInfo}
              fields={[
                {
                  key: 'blood_group',
                  label: 'Blood Group',
                  placeholder: 'e.g. O+',
                },
                {
                  key: 'allergies',
                  label: 'Allergies',
                  placeholder: 'Known allergies',
                },
                {
                  key: 'medications',
                  label: 'Medications',
                  placeholder: 'Current medications',
                  textarea: true,
                },
                {
                  key: 'medical_conditions',
                  label: 'Medical Conditions',
                  placeholder: 'Important conditions',
                  textarea: true,
                },
                {
                  key: 'doctor_name',
                  label: 'Doctor Name',
                  placeholder: 'Primary doctor',
                },
                {
                  key: 'doctor_phone',
                  label: 'Doctor Phone',
                  placeholder: 'Contact number',
                  type: 'tel',
                },
                {
                  key: 'hospital',
                  label: 'Preferred Hospital',
                  placeholder: 'Hospital name',
                },
                {
                  key: 'emergency_contact',
                  label: 'Emergency Contact',
                  placeholder: 'Primary emergency contact',
                },
                {
                  key: 'notes',
                  label: 'Additional Notes',
                  placeholder: 'Anything important for emergencies',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* DIGITAL */}

          {activeTab === 'digital' && (
            <ListSection
              title="Digital Accounts"
              description="Keep references to important digital services."
              icon={Smartphone}
              items={digitalAccounts}
              setItems={setDigitalAccounts}
              empty={EMPTY_DIGITAL}
              fields={[
                {
                  key: 'platform',
                  label: 'Platform',
                  placeholder: 'e.g. Google / Apple / Banking',
                },
                {
                  key: 'username',
                  label: 'Username / Email',
                  placeholder: 'Account identifier',
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  placeholder: 'Never store passwords here',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* DATES */}

          {activeTab === 'dates' && (
            <ListSection
              title="Important Dates"
              description="Record dates your family should remember."
              icon={CalendarDays}
              items={importantDates}
              setItems={setImportantDates}
              empty={EMPTY_DATE}
              fields={[
                {
                  key: 'title',
                  label: 'Event',
                  placeholder: 'e.g. Insurance Renewal',
                },
                {
                  key: 'date',
                  label: 'Date',
                  type: 'date',
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  placeholder: 'Reminder details',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* FUNERAL */}

          {activeTab === 'funeral' && (
            <ObjectSection
              title="Funeral Wishes"
              description="Document personal preferences and important arrangements."
              icon={Heart}
              data={funeralWishes}
              setData={setFuneralWishes}
              fields={[
                {
                  key: 'preferences',
                  label: 'Preferences',
                  placeholder: 'Personal preferences',
                  textarea: true,
                },
                {
                  key: 'burial_cremation',
                  label: 'Burial / Cremation',
                  placeholder: 'Preferred arrangement',
                },
                {
                  key: 'location',
                  label: 'Preferred Location',
                  placeholder: 'Location',
                },
                {
                  key: 'fund_allocated',
                  label: 'Fund Allocated',
                  placeholder: 'e.g. ₹2,00,000',
                },
                {
                  key: 'notes',
                  label: 'Additional Notes',
                  placeholder: 'Any other wishes',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* FAMILY TREE */}

          {activeTab === 'tree' && (
            <ListSection
              title="Family Tree"
              description="Keep a simple record of important family relationships."
              icon={GitBranch}
              items={familyTree}
              setItems={setFamilyTree}
              empty={EMPTY_FAMILY_TREE}
              fields={[
                {
                  key: 'name',
                  label: 'Family Member',
                  placeholder: 'Full name',
                },
                {
                  key: 'relation',
                  label: 'Relationship',
                  placeholder: 'e.g. Father',
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  placeholder: 'Additional information',
                  textarea: true,
                },
              ]}
            />
          )}

          {/* SAVE PANEL */}

          <div className="mt-6 overflow-hidden rounded-3xl border border-primary/20 bg-primary/5">

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-base-color">
                    Keep your family information up to date
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    Your changes are saved to your secure
                    Family Guidance record.
                  </p>
                </div>

              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleSave}
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Family Guidance
                  </>
                )}
              </Button>

            </div>

          </div>

        </main>

      </div>

      {/* MOBILE NAV */}

      <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-md -translate-x-1/2 lg:hidden">

        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface/95 p-2 shadow-xl backdrop-blur">

          <button
            type="button"
            onClick={() => {
              const current =
                TABS.findIndex(
                  (tab) =>
                    tab.id === activeTab
                );

              const previous =
                TABS[
                  Math.max(
                    0,
                    current - 1
                  )
                ];

              setActiveTab(
                previous.id
              );
            }}
            className="flex h-10 flex-1 items-center justify-center rounded-xl text-xs text-muted hover:bg-surface-2"
          >
            Previous
          </button>

          <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
            {activeDefinition.short}
          </div>

          <button
            type="button"
            onClick={() => {
              const current =
                TABS.findIndex(
                  (tab) =>
                    tab.id === activeTab
                );

              const next =
                TABS[
                  Math.min(
                    TABS.length - 1,
                    current + 1
                  )
                ];

              setActiveTab(next.id);
            }}
            className="flex h-10 flex-1 items-center justify-center rounded-xl text-xs text-muted hover:bg-surface-2"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
}