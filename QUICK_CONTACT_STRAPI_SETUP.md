# Quick Contact - Service Providers Strapi Setup

This document provides instructions for setting up the **Service Providers** content type in Strapi CMS for the Quick Contact feature.

---

## Overview

The Quick Contact feature allows residents to find and contact trusted service providers in the community, such as plumbers, electricians, gardeners, carpenters, painters, mechanics, AC repair services, cleaning services, and more.

---

## Content Type: Service Provider

**API Name:** `service-provider` (plural: `service-providers`)  
**Display Name:** "Service Provider"  
**Type:** Collection Type

---

## Fields Schema

| Field Name | Type | Settings | Required | Description |
|------------|------|----------|----------|-------------|
| `name` | Text (Short text) | - | ✅ Yes | Service provider's name or business name |
| `serviceType` | Text (Short text) | - | ✅ Yes | Type of service (e.g., "plumber", "electrician", "gardener") |
| `phone` | Text (Short text) | - | ✅ Yes | Contact phone number |
| `email` | Email | - | ❌ No | Contact email address |
| `address` | Text (Long text) | - | ❌ No | Service provider's address |
| `description` | Text (Long text) | - | ❌ No | Brief description of services offered |
| `rating` | Number (Decimal) | Min: 0, Max: 5 | ❌ No | Rating from 1-5 (optional) |
| `verified` | Boolean | Default: false | ❌ No | Whether provider is verified by RWA |
| `available` | Boolean | Default: true | ❌ No | Whether provider is currently available |
| `emergency` | Boolean | Default: false | ❌ No | Whether provider offers emergency services |
| `order` | Number (Integer) | Default: 0 | ❌ No | Display order (lower numbers appear first) |

---

## Field Details

### 1. name (Text - Short text)
- **Required:** Yes
- **Example:** "John's Plumbing Services"
- **Description:** The name of the service provider or business

### 2. serviceType (Text - Short text)
- **Required:** Yes
- **Example Values:**
  - `plumber` - For plumbers
  - `electrician` - For electricians
  - `gardener` - For gardeners/landscapers
  - `carpenter` - For carpenters
  - `painter` - For painters
  - `mechanic` - For mechanics
  - `ac-repair` or `ac-repairer` - For AC repair services
  - `cleaner` or `cleaning` - For cleaning services
  - `security` - For security services
- **Description:** The type of service provided. Used to group providers and display appropriate icons.

### 3. phone (Text - Short text)
- **Required:** Yes
- **Example:** "+91 98765 43210" or "9876543210"
- **Description:** Contact phone number. Will be used for `tel:` links.

### 4. email (Email)
- **Required:** No
- **Example:** "john.plumber@example.com"
- **Description:** Contact email address. Will be used for `mailto:` links.

### 5. address (Text - Long text)
- **Required:** No
- **Example:** "Block C, Unit 101, Greenwood City"
- **Description:** Service provider's address or location

### 6. description (Text - Long text)
- **Required:** No
- **Example:** "Expert plumbing services for all your needs. Available 24/7 for emergencies."
- **Description:** Brief description of services offered

### 7. rating (Number - Decimal)
- **Required:** No
- **Min:** 0
- **Max:** 5
- **Example:** 4.5
- **Description:** Rating from 1-5 (optional). Displayed with star icon.

### 8. verified (Boolean)
- **Required:** No
- **Default:** false
- **Description:** Whether the provider is verified by RWA. Shows a "Verified" badge.

### 9. available (Boolean)
- **Required:** No
- **Default:** true
- **Description:** Whether the provider is currently available for new work

### 10. emergency (Boolean)
- **Required:** No
- **Default:** false
- **Description:** Whether the provider offers emergency services. Shows an "Emergency" badge.

### 11. order (Number - Integer)
- **Required:** No
- **Default:** 0
- **Description:** Display order. Lower numbers appear first. Used for sorting within service types.

---

## API Endpoint

### Get All Service Providers
```
GET /api/service-providers?populate=*&sort[0]=order:asc&sort[1]=name:asc
```

### Get Service Providers by Type
```
GET /api/service-providers?populate=*&filters[serviceType][$eqi]=plumber&sort[0]=order:asc
```

**Query Parameters:**
- `populate=*` - Populate all relations
- `sort[0]=order:asc` - Sort by order field (ascending)
- `sort[1]=name:asc` - Secondary sort by name (ascending)
- `filters[serviceType][$eqi]={type}` - Filter by service type (case-insensitive)

---

## API Permissions

Enable public API access:

1. Go to **Settings → Users & Permissions Plugin → Roles → Public**
2. Enable the following permissions for `service-provider`:
   - ✅ **find** (List all service providers)
   - ✅ **findOne** (Get single service provider)

---

## Example Data

### Plumber
```json
{
  "name": "John's Plumbing Services",
  "serviceType": "plumber",
  "phone": "+91 98765 43210",
  "email": "john.plumber@example.com",
  "address": "Block C, Unit 101",
  "description": "Expert plumbing services for all your needs. Available 24/7 for emergencies.",
  "rating": 4.5,
  "verified": true,
  "available": true,
  "emergency": true,
  "order": 1
}
```

### Electrician
```json
{
  "name": "Spark Electric Solutions",
  "serviceType": "electrician",
  "phone": "+91 98765 43212",
  "email": "spark.electric@example.com",
  "address": "Block C, Unit 302",
  "description": "Licensed electrician for all electrical repairs and installations.",
  "rating": 4.7,
  "verified": true,
  "available": true,
  "emergency": true,
  "order": 1
}
```

### Gardener
```json
{
  "name": "Green Thumb Landscaping",
  "serviceType": "gardener",
  "phone": "+91 98765 43211",
  "email": "greenthumb@example.com",
  "address": "Block C, Unit 205",
  "description": "Professional gardening and landscaping services. Weekly maintenance available.",
  "rating": 4.8,
  "verified": true,
  "available": true,
  "emergency": false,
  "order": 1
}
```

---

## Service Type Icons

The frontend automatically maps service types to icons:

| Service Type | Icon | Description |
|--------------|------|-------------|
| `plumber` | 🔧 Wrench | Plumbing services |
| `electrician` | ⚡ Zap | Electrical services |
| `gardener` / `landscaper` | 🌲 TreePine | Gardening/landscaping |
| `carpenter` | 🔨 Hammer | Carpentry services |
| `painter` | 🎨 Paintbrush | Painting services |
| `mechanic` | 🚗 Car | Auto mechanic |
| `ac-repair` / `ac-repairer` | 💨 Wind | AC repair |
| `cleaner` / `cleaning` | ✨ Sparkles | Cleaning services |
| `security` | 🛡️ Shield | Security services |
| Default | 🔧 Wrench | Fallback icon |

---

## Content Entry Guidelines

### Service Type Values
- Use lowercase, hyphenated values (e.g., `ac-repair` not `AC Repair`)
- Common values: `plumber`, `electrician`, `gardener`, `carpenter`, `painter`, `mechanic`, `ac-repair`, `cleaner`, `security`

### Phone Numbers
- Format: Include country code if applicable (e.g., "+91 98765 43210")
- Will be used for `tel:` links, so ensure it's clickable format

### Verification
- Only mark providers as `verified: true` if they have been verified by RWA
- Verified providers show a green "Verified" badge

### Emergency Services
- Mark `emergency: true` for providers who offer 24/7 emergency services
- Shows a red "Emergency" badge

### Order Field
- Use `order` to control display order within each service type
- Lower numbers appear first
- If not set, providers are sorted alphabetically by name

---

## Frontend Integration

The frontend automatically:
1. Groups providers by service type
2. Displays appropriate icons for each service type
3. Shows verification and emergency badges
4. Enables click-to-call and click-to-email functionality
5. Sorts providers by order, then by name

**Page URL:** `/quick-contact`

**Navigation:** Added to "More" menu in mobile navigation

---

## Testing

### Test API Endpoint
```bash
# Get all service providers
curl http://localhost:1337/api/service-providers?populate=*

# Get plumbers only
curl http://localhost:1337/api/service-providers?populate=*&filters[serviceType][$eqi]=plumber
```

### Verify Frontend
1. Navigate to `/quick-contact` page
2. Verify providers are grouped by service type
3. Check icons are displayed correctly
4. Test click-to-call and click-to-email functionality
5. Verify badges (Verified, Emergency) display correctly

---

## Best Practices

1. **Verification:** Only verify providers that have been checked by RWA
2. **Service Types:** Use consistent service type values
3. **Contact Info:** Always include phone number, email is optional but recommended
4. **Descriptions:** Keep descriptions concise but informative
5. **Ordering:** Use order field to prioritize recommended providers
6. **Availability:** Update `available` field regularly to reflect current status

---

## Troubleshooting

### Providers Not Showing
- Check API permissions are enabled for Public role
- Verify `populate=*` is included in API call
- Check service providers are published in Strapi

### Icons Not Displaying
- Verify service type matches exactly (case-insensitive)
- Check service type uses supported values
- Default icon will be used if type doesn't match

### Sorting Issues
- Ensure `order` field is set correctly
- Check API includes `sort[0]=order:asc` parameter

---

## Support

For issues or questions:
1. Check Strapi logs for API errors
2. Verify content type schema matches this documentation
3. Test API endpoints directly
4. Check browser console for frontend errors

