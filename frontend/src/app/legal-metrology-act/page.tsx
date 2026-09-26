import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalMetrologyActPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
      <PublicHeader />

      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <div className="bg-[#f0f3ff] border-b border-[#cbd5e1] py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#004e9f] hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-[#111c2d]">The Legal Metrology Act, 2009</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white border-x border-[#cbd5e1] shadow-sm min-h-screen">
          <div className="prose prose-slate max-w-none prose-headings:text-[#004e9f] prose-a:text-[#004e9f]">
            <p>
              The Act received the assent of the President on the 13th January, 2010 and came into force with effect from 1st April, 2011. Department of Consumer Affairs is the nodal agency for the implementation of the Act. Specific Provisions under the Act are:
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-4 text-[#004e9f]">Specific Provisions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-slate-300 mb-6">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-sm">S.No.</th>
                    <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-sm">Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">1</td><td className="border border-slate-300 px-4 py-2 text-sm">The Legal Metrology Act, 2009 is a single Act covering the provisions of the Standards of Weights and Measures Act, 1976 and Standards of Weights and Measures (Enforcement) Act, 1985</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">2</td><td className="border border-slate-300 px-4 py-2 text-sm">The Act is having only 57 Sections</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">3</td><td className="border border-slate-300 px-4 py-2 text-sm">No registration of users of weights and measures is required</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">4</td><td className="border border-slate-300 px-4 py-2 text-sm">Registration for export of weights and measures is not required</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">5</td><td className="border border-slate-300 px-4 py-2 text-sm">The penalty provisions of different offences have been increased</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">6</td><td className="border border-slate-300 px-4 py-2 text-sm">Standardization of units of weights and measures based on metric system</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">7</td><td className="border border-slate-300 px-4 py-2 text-sm">Declarations on pre-packaged commodities</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">8</td><td className="border border-slate-300 px-4 py-2 text-sm">Approval of model of weight or measure before manufacturing/ import</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">9</td><td className="border border-slate-300 px-4 py-2 text-sm">Prohibition on manufacture, repair or sale of weight or measure without license</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">10</td><td className="border border-slate-300 px-4 py-2 text-sm">Verification and stamping of weight or measure</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">11</td><td className="border border-slate-300 px-4 py-2 text-sm">Only one nominated Director of the company will be responsible for the offences done by the company under the Legal Metrology Act</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 text-sm text-center">12</td><td className="border border-slate-300 px-4 py-2 text-sm">Provision of Government Approved Test Centre has been introduced.</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-[#004e9f]">3. Rules Framed Under the Act</h3>
            <p>The following seven rules have been framed under the Act:</p>

            <div className="space-y-6 mt-4">
              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">3.1. The Legal Metrology (General) Rules, 2011:</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  Specifications for weighing and measuring instruments have been prescribed in the Legal Metrology (General) Rules, 2011 which include around 40 types of weighing and measuring instruments such as electronic weighing instruments, weighbridges, petrol pumps, water meter, sphygmomanometer, clinical thermometer etc. These weighing and measuring instruments are used by industries, traders, hospitals and various government and non-government organizations for the weighing and measurement purpose and the end results of the weighing and measuring is directly for the benefit of the common people. These weighing and measuring instruments are periodically verified by the State Government officers using the Standard Weights and Measures and the procedure prescribed in the Rules.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">3.2. The Legal Metrology (Packaged Commodities) Rules, 2011:</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  &apos;Pre-packaged commodity&apos; is defined under the Act as, &apos;a commodity which without the purchaser being present is placed in a package of whatever nature, whether sealed or not, so that the product contained therein has a pre-determined quantity&apos;.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  As per the Legal Metrology (Packaged Commodities) Rules, 2011 certain mandatory declarations have to be made on every package, which are:
                </p>
                <ul className="list-none space-y-1 mt-2 text-sm text-[#414753] pl-4">
                  <li>(i) Name and address of the manufacturer/ packer/ importer;</li>
                  <li>(ii) Country of origin for imported products;</li>
                  <li>(iii) Common or generic name of the commodity contained in the package;</li>
                  <li>(iv) Net quantity, in terms of standard unit of weight or measure or in number;</li>
                  <li>(v) Month and year of manufacture;</li>
                  <li>(vi) Best before/ use by date, month and year for the commodities which may become unfit for human consumption.</li>
                  <li>(vii) Retail sale price in the form of Maximum Retail Price (MRP) Rs….. Inclusive of all taxes;</li>
                  <li>(viii) Consumer care details</li>
                  <li>(ix) Where the sizes of the commodity contained in the package are relevant, the dimensions of the commodity contained in the package and if the dimensions of the different pieces are different, the dimensions of each such different piece shall be mentioned.</li>
                  <li>(x) Unit sale price</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">3.3. The Legal Metrology (Approval of Models) Rules, 2011:</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  Manufacturers/ Importers of Weighing and Measuring equipment, which are prescribed Under the Legal Metrology Act, 2009 and rules made there under, are required to take approval of the Government of India before manufacturing/ import.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  Some of the equipment like cast iron, brass, bullion, or carat weight or any beam scale, length measures (not being measuring tapes) which are ordinarily used in retail trade for measuring textiles or timber, capacity measures, not exceeding twenty litre in capacity are not required to obtain Model approval.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">3.4. The Legal Metrology (National Standards) Rules, 2011:</h4>
                <ul className="list-none space-y-1 mt-2 text-sm text-[#414753] pl-4">
                  <li>(i) Under the Rules there is provision of National Prototypes/various standards are kept at National Physical Laboratory.</li>
                  <li>(ii) Reference Standards of weights and measures are kept at Regional Reference Standard Laboratory at Ahmedabad, Bangalore, Faridabad, Bhubaneswar and Guwahati.</li>
                  <li>(iii) Reference Standards are used for the verification of Secondary Standards Weights & Measures which are part of state government laboratories.</li>
                  <li>(iv) The Working Standard Weights & Measures are available at the district level which are used for the verification of any Weight & Measures used by traders and manufacturers for the transaction and protection purposes. The Working Standard Weights & Measures are verified by the Secondary Standard Weights & Measures.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">3.5. The Legal Metrology (Numeration) Rules, 2011:</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  Under these rules the provision is made for making Numeration and the Manner in which numbers shall be written.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">3.6. Indian Institute of Legal Metrology Rules, 2011:</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  Indian Institute of Legal Metrology, Ranchi is the training institute for providing training in the field of Legal Metrology to the Legal Metrology Officers of States/ UTs/ Union of India, under the administrative control of this Department. Under these rules provisions regarding Courses to be imparted at the Institute, Obligatory functions of the Institute, Qualification of persons to be eligible for admission in the Institute are prescribed.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">3.7. The Legal Metrology (Government Approved test Centre) Rules, 2013:</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  The Government Approved Test Centre (GATC) Rules are framed for approval of GATCs established by the private persons for the verification of some of the weights and measures, in addition to verification done by the State Government Officers. The weights and measures prescribed under these rules for the verification by a GATC are:- (i) Water meter, (ii) Sphygmomanometer, (iii) Clinical Thermometer, (iv) Automatic Rail Weighbridges, (v) Tape Measures, (vi) Non-automatic weighing instrument of Accuracy Class-IIII/ Class-III (upto 150kg), (vii) Load cell, (viii) Beam Scale, (ix) Counter Machine and (x) Weights of all Categories.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">3.8. State Legal Metrology (Enforcement) Rules</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  The State Governments have also framed their State Legal Metrology (Enforcement) Rules for the implementation of the Act, 2009.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-[#004e9f]">4. Functions of the Legal Metrology</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#414753]">
              Precision & accuracy in measurement plays very vital role in day to day life. A transparent and efficient legal metrology system inspires confidence in trade, industry and consumer and brings harmonious environment for conducting business by way of:
            </p>
            <ul className="list-none space-y-1 mt-2 text-sm text-[#414753] pl-4">
              <li>(i) contribution to the economy of the country by increasing the revenue in various sectors.</li>
              <li>(ii) playing important role in reducing the revenue losses in the coal, mines, industries, petroleum, railways.</li>
              <li>(iii) reduction of the loss and wastage in the infrastructure sector.</li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-[#414753]">
              The work performed by the Legal Metrology therefore, is vital to the public interest. Director, Legal Metrology is a statutory authority with powers and responsibilities prescribed under the Legal Metrology Act, 2009 relating to inter-state trade and commerce of weights and measures including pre-packaged commodities. Director, Legal Metrology is also responsible for establishing standards of Legal Metrology and maintaining traceability of Standards relating to Legal Metrology. The primary responsibilities of the Director are in the nature of Regulation, Enforcement and Research, Regulation and Enforcement functions to undertake technical field inspections, searches, seizures, registration of offices and launching prosecutions.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#414753]">
              The enforcement of Legal Metrology Laws is done by the State Governments by the Controller of Legal Metrology and other Legal Metrology Officers as per the provisions of Act.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-[#004e9f]">5. Attached Organizations</h3>
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">5.1. Regional Reference Standard Laboratories (RRSLs)</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  Regional Reference Standard Laboratories (RRSLs) are set up to meet the Legal Metrology requirements of the State Governments, Industries and Consumers in the country. There are six RRSLs, situated at Ahmedabad, Bangalore, Bhubaneswar, Faridabad, Guwahati and Varanasi. The Regional Reference Standards Laboratories serve as a link between the National Physical Laboratory and the States Weights & Measure laboratories to ensure the correct weighment and measurement in trade and transaction. One new RRSL is being established at Nagpur, Maharashtra. The Legal Metrology Division of the Department have already been certified by ISO/IEC/17065:2012. For dissemination of Indian Standard Time (IST), Time dissemination Laboratories are being set up at Five RRSLs situated at Ahmedabad, Bangalore, Bhubaneswar, Faridabad and Guwahati in collaboration with NPL and ISRO.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  These laboratories are responsible for verification of secondary standards of State Government, testing of models of weights and measures, Calibration of sophisticated weighing and measuring instruments and organizing of consumer awareness program etc.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#111c2d]">5.2. Indian Institute of Legal Metrology, Ranchi</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#414753]">
                  Indian Institute of Legal Metrology, Ranchi is the National Centre for imparting professional training to the Legal Metrology officers. It also provides training to the foreign participants of the neighboring /developing countries. This is a residential training institute and having an approximate area of 17 acres. It has all the facilities for organizing training and seminars. The institute offers the Basic Training Course in the field of Legal Metrology to the Legal Metrology Officers which is compulsory. The said course imparts knowledge pertaining to the Legal Metrology Acts and Rules and their implementation in the field. Apart from this it organises various refresher courses and seminars on Legal Metrology on a regular basis. In a calendar year approximately 200 officials of Legal Metrology of different States and UTs are being trained by IILM. There are good laboratories, hostel facilities and a hostel cum guest house in the premises.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
