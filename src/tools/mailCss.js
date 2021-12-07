export const mailCss = `::-moz-selection {
    color: white;
    background-color: #660099;
}
::-webkit-selection {
    color: white;
    background-color: #660099;
}
::selection {
    color: white;
    background-color: #660099;
}
body {
    margin: 0;
    padding: 0;
    overflow-x: auto;
    overflow-y: hidden;
    background: none transparent;
    font-family: -apple-system,  sans-serif;
}
img {
    max-width: 100%;
    height: auto!important;
}
a {
    color: #660099;
    word-break: break-word;
}
body.render > div > table.GcContainer *[style*="width: 600px"], body.general table.container[style*="width: 600px"] {
    width: 100%!important;
}
body.render > div > table.GcContainer *[style*="width: 590px"] {
    width: calc(100% - 10px)!important;
}`;

export const mailDarkCss = `:root {
    color-scheme: dark;
    background-color: #1E1E1E;
}
::-moz-selection {
    color: black;
    background-color: #D099E0;
}
::-webkit-selection {
    color: black;
    background-color: #D099E0;
}
::selection {
    color: black;
    background-color: #D099E0;
}
body:not([bgcolor]) {
    background-color: #1E1E1E;
    color: white;
}
body:not([bgcolor]) img {
    filter: brightness(.85);
}
body[bgcolor] {
    filter: brightness(.85);
    color: black;
    background-color: #1E1E1E;
}
a {
    color: #D099E0;
}
tr#planyourdayheaderview table {
    filter: invert(1) hue-rotate(180deg);
}
tr#planyourdayheaderview table td.planyourdayheaderhello p, tr#planyourdayheaderview table td.planyourdayheadergreeting p {
    color: white!important;
}
td.planYourDayTaskSection, td.planYourDaySectionHeader, tr#feedbackview td.planyourdayfooterbackground, tr#feedbackview td.planyourdayfooterbackground table, tr#feedbackview td.planyourdayfooterbackground table td.planyourdayfooterbackground, tr#planyourdayfooterview td.planyourdayfooterbackground, table.tableFlushedV2 td.header, table.tableFlushedV2 td.header table.planYourDayIntroHeaderInnerTable, tr#email-task-slot > td.task-slot, tr#email-task-slot > td.task-slot table.combined-task-table-inner, tr.sectionheaderv2view table tr td.sectionheadercell, td.planyourdaybrandingattributioncontent.planyourdayattributionoutercell {
    background-color: #2b2b2b!important;
}
tr#email-task-slot > td.task-slot table.combined-task-table-inner p.descriptionText {
    color: #a9a9a9!important;
}
table.tableFlushedV2 td.header table.planYourDayIntroHeaderInnerTable {
    border-bottom: 1px solid #2b2b2b!important;
}
tr#taskslotv2view > td {
    background-color: #363636!important;
}
tr#taskslotv2view > td a, tr#feedbackview td.planyourdayfooterbackground table td.planyourdayfooterbackground a, tr#planyourdayfooterview td.planyourdayfooterbackground table a {
    color: #5aa1d7!important;
}
tr#taskslotv2view td.task-slot-details p.descriptionText, tr#planyourdayfooterview td.planyourdayfooterbackground p.planyourdayfootertext.planyourdayfootertextdefault {
    color: white!important;
}
tr#planyourdayfooterview td.planyourdayfooterbackground p.planyourdayfootertextbold.footercanadatitle, tr#planyourdayfooterview td.planyourdayfooterbackground p.planyourdayfootertext.footercanadaleftbody, tr#planyourdayfooterview td.planyourdayfooterbackground p.planyourdayfootertext.footercanadaleftbody {
    color: #acacac!important;
}
div#MMlinks, div.na-testnews-content > div.toc {
    background-color: #3a3a3a!important;
}
body.render table.GcContainer {
    filter: brightness(.85);
}`;

export const mailTextCss = `body {
    white-space: pre-wrap;
}`;

export default {
    mailCss,
    mailDarkCss,
    mailTextCss,
};
