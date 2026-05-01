# ATS Resume Optimizer

A free, privacy-first resume checker that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS).

## Features

- ✅ **100% Private:** All processing happens in your browser. No data is uploaded to servers.
- ✅ **No Signup Required:** Use immediately without creating an account.
- ✅ **Multi-Format Support:** Handles PDF and DOCX files.
- ✅ **Intelligent Matching:** Semantic synonym matching across professional families.
- ✅ **Professional Reports:** Download detailed PDF audit reports.
- ✅ **Mobile-Friendly:** Fully responsive design works on all devices.

## How It Works

1. **Upload:** Paste the job description and upload your resume (PDF or DOCX)
2. **Analyze:** Our algorithm extracts keywords, checks structure, and measures impact
3. **Improve:** Get a detailed score with specific recommendations
4. **Download:** Generate a professional PDF report

## Scoring Methodology

- **Keyword Match (50%):** How well your resume matches the job description keywords
- **Structure & Parsability (20%):** Whether your resume has standard sections
- **Impact & Metrics (30%):** Use of quantifiable achievements and strong action verbs

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **PDF Processing:** PDF.js
- **DOCX Processing:** Mammoth.js
- **PDF Generation:** jsPDF
- **Design:** Glassmorphic UI with custom gradients
- **Fonts:** Inter (Google Fonts)

## Deployment Instructions

### Quick Deploy (Recommended)

#### Option 1: Vercel (Easiest)
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project folder: `cd ATS-Checker`
3. Deploy: `vercel`
4. Follow prompts to link your account
5. Your site will be live at `your-project.vercel.app`

#### Option 2: Netlify
1. Drag and drop the `ATS-Checker` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repo for automatic deployments
3. Site will be live at `your-project.netlify.app`

#### Option 3: GitHub Pages
1. Create a GitHub repository
2. Upload all files to the repo
3. Go to Settings > Pages
4. Select "Deploy from main branch"
5. Site will be at `username.github.io/repo-name`

### Custom Domain Setup

1. Buy domain from Namecheap, GoDaddy, or Hostinger
2. Add DNS records in your hosting platform (Vercel/Netlify):
   - Type: `A` or `CNAME`
   - Name: `@` or `www`
   - Value: Provided by hosting platform
3. Wait 24-48 hours for DNS propagation

### Google AdSense Setup

1. **Before Applying:**
   - Deploy site to custom domain
   - Ensure all pages are live (About, Privacy, Terms, Contact)
   - Add 10-15 blog posts (optional but helps approval)
   - Site should have clean design and original content

2. **Apply for AdSense:**
   - Go to [Google AdSense](https://www.google.com/adsense)
   - Sign up with your Google account
   - Add your website URL
   - Copy the AdSense code snippet

3. **Add AdSense Code:**
   - Replace `ca-pub-XXXXXXXXXXXXXXXX` in index.html with your Publisher ID
   - Replace `XXXXXXXXXX` with your Ad Unit IDs
   - Paste the AdSense script in `<head>` section:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossorigin="anonymous"></script>
   ```

4. **Wait for Approval:**
   - Typically takes 1-2 weeks
   - Google will review your site
   - You'll receive approval via email

### Google Analytics Setup

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property
3. Get your Measurement ID (e.g., `G-XXXXXXXXXX`)
4. Add this code to `<head>` section of all pages:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Google Search Console Setup

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (use domain method for better coverage)
3. Verify ownership (use DNS record or HTML file method)
4. Submit your `sitemap.xml`: `https://yourdomain.com/sitemap.xml`
5. Monitor indexing status and search performance

## File Structure

```
ATS-Checker/
├── index.html          # Main application page
├── about.html          # About page
├── contact.html        # Contact page
├── privacy.html        # Privacy policy (required for AdSense)
├── terms.html          # Terms of service
├── style.css           # All styles
├── script.js           # All functionality
├── robots.txt          # SEO: Search engine instructions
├── sitemap.xml         # SEO: Sitemap for Google
├── test-resume.txt     # Sample resume for testing
└── README.md           # This file
```

## AdSense Placement Zones

The site has 3 optimized ad zones:
1. **Top Banner:** Above the tool (728x90 or responsive)
2. **In-Content:** Between tool and FAQ (336x280)
3. **Bottom Banner:** After FAQ section (728x90 or responsive)

## SEO Optimization

- ✅ Semantic HTML5 structure
- ✅ Schema.org markup (WebApplication)
- ✅ Meta descriptions on all pages
- ✅ FAQ section for featured snippets
- ✅ Mobile-responsive design
- ✅ Fast loading (client-side processing)
- ✅ Sitemap and robots.txt
- ✅ Internal linking structure

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Privacy & Security

- No backend server required
- No user data collection or storage
- All processing happens client-side
- GDPR and privacy-law compliant
- Cookie consent banner included

## Future Enhancements

- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Cover letter analyzer
- [ ] LinkedIn profile optimizer
- [ ] Industry-specific templates
- [ ] Real-time keyword suggestions
- [ ] Browser extension

## License

© 2026 ATS Optimizer. All rights reserved.

## Support

For questions or issues:
- Email: support@atsoptimizer.com
- Website: [Contact Page](contact.html)

## Development

To run locally:
1. Clone/download the repository
2. Open `index.html` in a modern browser
3. No build process or server required!

## Contributing

Found a bug or have a suggestion? Contact us through the contact page.

---

**Built with ❤️ for job seekers everywhere.**
