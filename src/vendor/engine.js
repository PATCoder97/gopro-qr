// Adapted from GoPro Labs control/custom (Apache-2.0).
// Changes: module wrapper, callbacks, no polling/clipboard/QR dependency,
// one handler per target, state serialization and corrected FPS mapping.
export function createEngine(onCommand) {
var clipcopy = "";
var lastcmd = "";
var lasttimecmd = "xxxxxxxxx";
var changed = false;
var ms = 0;
var lastms = 0;
var timechecked = false;
var once = true;
var even = 0;
var qrcode;
var i;

var spot_x = 50
var spot_y = 50;
var id = 0;
var icon_num = 0;
var last_icon_num = 0;
var newpresent = "";

function id5() {  // 5 characters, so up to 17-bit ID
  return ([1111]+1).replace(/1/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] % 10 >> c / 4).toString()
  );
}

function getMachineId()
{
    let machineId = localStorage.getItem('MachineId');
    if (!machineId) {
        //machineId = crypto.randomUUID();
        machineId = id5();
        localStorage.setItem('MachineId', machineId);
    }
    return machineId;
}

function makeQR() {}

function HTMLPrint(txt)
{
    var txt2 = txt.replaceAll("<", "&#60;");
    var newtxt = txt2.replaceAll(">", "&#62;");
    return newtxt;
}
function URLPrint(txt)
{
    var txt2 = txt.replaceAll("+", "%2B");
    var txt3 = txt2.replaceAll("#", "%23");
    var txt4 = txt3.replaceAll("%", "%25");
    var txt5 = txt4.replaceAll("&", "%26");
    return txt5;
}

function unicodeToAscii(codepoint) {
    if (codepoint < 0xC0) {
        // Pass all ASCII characters unaltered
        return String.fromCharCode(codepoint);
    }

    const mapping = {
        0x00C0: 'A', 0x00C1: 'A', 0x00C2: 'A', 0x00C3: 'A', 0x00C4: 'A', 0x00C5: 'A',
        0x00E0: 'a', 0x00E1: 'a', 0x00E2: 'a', 0x00E3: 'a', 0x00E4: 'a', 0x00E5: 'a',
        0x00C8: 'E', 0x00C9: 'E', 0x00CA: 'E', 0x00CB: 'E',
        0x00E8: 'e', 0x00E9: 'e', 0x00EA: 'e', 0x00EB: 'e',
        0x00CC: 'I', 0x00CD: 'I', 0x00CE: 'I', 0x00CF: 'I',
        0x00EC: 'i', 0x00ED: 'i', 0x00EE: 'i', 0x00EF: 'i',
        0x00D2: 'O', 0x00D3: 'O', 0x00D4: 'O', 0x00D5: 'O', 0x00D6: 'O', 0x00D8: 'O',
        0x00F2: 'o', 0x00F3: 'o', 0x00F4: 'o', 0x00F5: 'o', 0x00F6: 'o', 0x00F8: 'o',
        0x00D9: 'U', 0x00DA: 'U', 0x00DB: 'U', 0x00DC: 'U',
        0x00F9: 'u', 0x00FA: 'u', 0x00FB: 'u', 0x00FC: 'u',
        0x00C7: 'C', 0x00E7: 'c',
        0x00D1: 'n', 0x00F1: 'n',
        0x0093: '"', 0x0094: '"', 0x201C: '"', 0x201D: '"',
        0x0091: '\'',0x0092: '\'',0x2018: '\'',0x2019: '\'',
        0x0082: ',',
        0x0090: '.',
        0x0096: '-', 0x0097: '-',
        0x0098: '~'
    };

    return mapping[codepoint] || '?'; // Default to '?' for unmapped code points
}

function startTime() {
    var today;
    var yy;
    var mm;
    var dd;
    var h;
    var m;
    var s;
    var timecodefps = 30;
    var cmd = "";
    var timenotchecked;

    dset("settingsRES", false);
    dset("noteMODE", false);
    dset("settingsFPS", false);
    dset("settingsFOV", false);
    dset("settingsPFOV", false);
    dset("settingsTLVFOV", false);
    dset("settingsTWFOV", false);
    dset("settingsZoom", false);
    dset("settingsRESTLV", false);
    dset("settingsCOMPTLV", false);
    dset("settingsVideo", false);
    dset("settingsHindsight", false);
    dset("settingsDuration", false);
    dset("settingsPhotoRAW", false);
    dset("settingsPT", false);
    dset("settingsPTR", false);
    dset("namedPresets", false);
    dset("spotMeter", false);
    dset("settingsBurst", false);
    dset("settingsTimewarp", false);
    dset("settingsTimelapse", false);
    dset("settingsNightlapse", false);
    dset("settingsNightexposure", false);
    dset("settingsAUDT",false);

    dset("ptCOLOR", false);
    dset("ptDEPTH", false);
    dset("ptBITRATE", false);
    dset("ptWBAL", false);
    dset("ptISO",false);
    dset("ptIMIN",false);
    dset("ptSHUT",false);
    dset("ptIMIN",false);
    dset("ptEV",false);
    dset("ptSHARP",false);
    dset("ptAUD",false);

    dset("opGPS", false);
    dset("opVC", false);
    dset("opQC", false);
    dset("opDM", false);
    dset("opBV", false);
    dset("opDB", false);
    dset("opLO", false);
    dset("opOR", false);
    dset("opAO", false);
    dset("opSO", false);
    dset("opWC", false);
    dset("opLN", false);

    dset("aS", false);
    dset("aE", false);
    dset("aSD", false);
    dset("aEND", false);
    dset("aSM", false);
    dset("aSV", false);
    dset("aR", false);

    var checkedmode = 0;
    var x;

    for (i = 1; i < 25; i++) {
        var mode = "m"+i;
        x = document.getElementById(mode).checked;
        if( x === true)
            checkedmode = i;
    }

    //m1 mV
    //m2 mVP
    //m3 mVE
    //m4 mVS

    //m5 mS
    //m6 mH
    //m7 mL

    //m8 mV0
    //m9 mV1
    //m10 mV2
    //m11 mV3
    //m12 mV4
    //m13 mTW
    //m14 mT
    //m15 mNL
    //m16 mST
    //m17 mLP
    //m18 mLT
    //m19 mP
    //m20 mPB
    //m21 mL
    //m22 mPN
    //m23 mTP
    //m24 mNP

    switch(checkedmode)
    {
        default:
        case 1: //Video
        case 2: //mVP
        case 3: //mVE
        case 4: //mVS

        case 5: //mS
        case 6: //mH
        case 7: //mL

        case 8 : //mV0
        case 9 : //mV1
        case 10: //mV2
        case 11: //mV3
        case 12: //mV4
        dset("settingsRES", true);
        dset("settingsFPS", true);
        dset("settingsFOV", true);
        dset("settingsVideo", true);
        dset("settingsHindsight", true);
        dset("settingsDuration", true);
        dset("settingsPT", true);
        dset("settingsAUDT",true);
        break;

        case 13: //TimeWarp Video
        dset("settingsTimewarp", true);
        dset("settingsDuration", true);
        dset("settingsRESTLV", true);
        dset("settingsTWFOV", true);
        dset("settingsPT", true);
        break;

        case 14: //Timelapse Video
        dset("settingsTimelapse", true);
        dset("settingsDuration", true);
        dset("settingsRESTLV", true);
        dset("settingsTLVFOV", true);
        dset("settingsPT", true);
        dset("noteMODE", true);
        break;

        case 15: //NL Video
        dset("settingsNightlapse", true);
        dset("settingsNightexposure", true);
        dset("settingsDuration", true);
        dset("settingsRESTLV", true);
        dset("settingsPT", true);
        dset("settingsTLVFOV", true);
        dset("noteMODE", true);
        break;


        case 16: //Stars
        dset("settingsTimelapse", true);
        dset("settingsDuration", true);
        dset("settingsCOMPTLV", true);
        dset("settingsPT", true);
        break;

        case 17: //Painting
        dset("settingsTimelapse", true);
        dset("settingsDuration", true);
        dset("settingsCOMPTLV", true);
        dset("settingsPT", true);
        break;

        case 18: //Cars
        dset("settingsTimelapse", true);
        dset("settingsDuration", true);
        dset("settingsCOMPTLV", true);
        dset("settingsPT", true);
        break;

        case 19: //Photo
        dset("settingsPT", true);
        dset("settingsPFOV", true);
        dset("settingsPhotoRAW", true);
        break;

        case 20: //Burst
        dset("settingsBurst", true);
        dset("settingsPT", true);
        dset("settingsTLVFOV", true);
        dset("settingsPhotoRAW", true);
        break;

        case 21: //Burst Live
        dset("settingsPT", true);
        dset("settingsAUDT",true);
        break;

        case 22: //Night
        dset("settingsNightexposure", true);
        dset("settingsPT", true);
        dset("settingsTLVFOV", true);
        dset("settingsPhotoRAW", true);
        break;

        case 23: //TLP
        dset("settingsTimelapse", true);
        dset("settingsPT", true);
        dset("settingsTLVFOV", true);
        dset("settingsPhotoRAW", true);
        dset("settingsDuration", true);
        dset("noteMODE", true);
        break;

        case 24: //NLP
        dset("settingsNightlapse", true);
        dset("settingsNightexposure", true);
        dset("settingsPT", true);
        dset("settingsTLVFOV", true);
        dset("settingsPhotoRAW", true);
        dset("settingsDuration", true);
        dset("noteMODE", true);
        break;

    }

    if(document.getElementById("np") !== null)
    {
        document.getElementById("ICONS_IMG").onclick = function (event)
        {
            const bounds=this.getBoundingClientRect();

            icon_num = Math.trunc(event.offsetX/70) + 6 * Math.trunc(event.offsetY/70);

            if(icon_num < 0) icon_num = 0;
            if(icon_num > 32) icon_num = 32;

            last_icon_num = icon_num;
        };

        if(document.getElementById("pdel") !== null)
        {
            if(document.getElementById("pdel").checked === true)
            {
                icon_num = -1;
            }
            else
            {
                icon_num = last_icon_num;
            }
        }

        if(document.getElementById("newpres") !== null)
        {
            newpresent = "oMPRES=\"" + icon_num + "," + document.getElementById("newpres").value.substring(0,16) + "\"";
        }
        else
            newpresent = "";

        dset("namedPresets", document.getElementById("np").checked);
    }

    if(document.getElementById("sm") !== null)
    {
        document.getElementById("LCD").onclick = function (event)
        {
            const bounds=this.getBoundingClientRect();

            spot_x = Math.trunc((event.offsetX - 77)*100/270);
            spot_y = Math.trunc((event.offsetY-50)*100/185);

            if(spot_x < 10) spot_x = 10;
            if(spot_x > 90) spot_x = 90;
            if(spot_y < 10) spot_y = 10;
            if(spot_y > 90) spot_y = 90;

            //alert("x: " + x + " y: " + y);
        };

        document.getElementById("coordtext").innerHTML = spot_x + "%," + spot_y + "%";

        dset("spotMeter", document.getElementById("sm").checked);
    }

    if(document.getElementById("pt") !== null)
    {
        if(document.getElementById("pt").checked === true)
            dset("settingsPTR", true);

        if(document.getElementById("pt").checked === true && document.getElementById("ptr").checked === false)
        {
            dset("ptCOLOR", true);
            dset("ptDEPTH", true);
            dset("ptWBAL", true);
            dset("ptISO",true);
            dset("ptIMIN",true);
            dset("ptSHUT",true);

            if(document.getElementById('iso8').checked === true)
            {
                //dset("ptSHUT",false);
                dset("ptEV",true);
            }
            else
            {
                //dset("ptSHUT",true);

                if(document.getElementById('shut7').checked === true || document.getElementById('shut6').checked === true)
                {  // not shutter lock
                    dset("ptEV",true);
                }
            }

            if(checkedmode >= 1 && checkedmode <= 12) //Video + audio modes
            {
                dset("ptAUD",true);
            }

            if(checkedmode >= 1 && checkedmode <= 15) //Video modes
            {
                dset("ptBITRATE", true);
            }

            dset("ptSHARP",true);
        }
    }


    if(document.getElementById("options") !== null)
    {
        if(document.getElementById("options").checked === true)
        {
            dset("opGPS", true);
            dset("opVC", true);
            dset("opQC", true);
            dset("opDM", true);
            dset("opBV", true);
            dset("opDB", true);
            dset("opLO", true);
            dset("opOR", true);
            dset("opAO", true);
            dset("opSO", true);
            dset("opWC", true);
            dset("opLN", true);
        }
    }

    if(document.getElementById("actions") !== null)
    {
        if(document.getElementById("actions").checked === true)
        {
            dset("aSD", true);
            dset("aEND", true);
            dset("aSM", true);
            dset("aSV", true);
            dset("aR", true);
        }
    }

    cmd = dcmd(cmd,"m");  // set mode

    switch(checkedmode)
    {
        case 13: //TWarp
            cmd = dcmd(cmd,"fpswarp");
            break;
        case 14: //TLV
            cmd = dcmd(cmd,"fpslapse");
            break;
        case 15: //NLV
            cmd = dcmd(cmd,"fpsnight");
            cmd = dcmd(cmd,"nightexp");
            break;
        case 20: //Burst
            cmd = dcmd(cmd,"b");
            break;
        case 21: //Live Burst
            break;
        case 22: //Night
            cmd = dcmd(cmd,"nightexp");
            break;
        case 23: //TLP
            cmd = dcmd(cmd,"fpslapse");
            break;
        case 24: //NLP
            cmd = dcmd(cmd,"fpsnight");
            cmd = dcmd(cmd,"nightexp");
            break;
    }


    if(document.getElementById("np") !== null)
    {
        if(document.getElementById("np").checked === true)
        {
            cmd = cmd + newpresent;
            cmd = dcmd(cmd,"m");  // set mode
        }
    }

    if(checkedmode <= 18)
    {
        if(checkedmode == 13 || checkedmode == 14 || checkedmode == 15) // TLV/TWarp Res/NLV
        {
            cmd = dcmd(cmd, "rt");
        }
        else if(checkedmode == 16 || checkedmode == 17 || checkedmode == 18) // COMP TLV
        {
            cmd = dcmd(cmd, "crt");
        }
        else
        {
            cmd = dcmd(cmd,"r"); //RES
        }
    }

    if(checkedmode <= 12) // video mode
    {
        cmd = dcmd(cmd,"p"); //fps
    }

    if(checkedmode > 12) // not video
    {
        if(checkedmode == 13) //TWarp
        {
            cmd = dcmd(cmd,"twf"); //fov

            if(	(document.getElementById("twf1").checked === true) || //Wide
                (document.getElementById("twf2").checked === true) /* || //Linear
                (document.getElementById("twf3").checked === true) */ ) //Linear+HL
            {
                dset("settingsZoom", true);

                var zoom = parseInt(document.getElementById("zoom").value);
                zoom *= 10;
                document.getElementById("zoomtext").innerHTML = zoom+"%";
                if(zoom == 100) zoom = 99;

                cmd = cmd + zoom; //fov
            }
        }
        else if(checkedmode == 19) //Photo
        {
            cmd = dcmd(cmd,"pf"); //fov

            if(	(document.getElementById("pf1").checked === true) || //Wide
                (document.getElementById("pf2").checked === true) ) //Linear
            {
                dset("settingsZoom", true);

                var zoom = parseInt(document.getElementById("zoom").value);
                zoom *= 10;
                document.getElementById("zoomtext").innerHTML = zoom+"%";
                if(zoom == 100) zoom = 99;

                cmd = cmd + zoom; //fov
            }
        }
        else if(checkedmode == 20) //Live Burst
        {
            dset("settingsZoom", true);

            var zoom = parseInt(document.getElementById("zoom").value);
            zoom *= 10;
            document.getElementById("zoomtext").innerHTML = zoom+"%";
            if(zoom == 100) zoom = 99;

            cmd = cmd + "fW" + zoom; //fov
        }
        else //Everything else
        {
            cmd = dcmd(cmd,"tlvf"); //fov

            if(	(document.getElementById("tlvf1").checked === true) || //Wide
                (document.getElementById("tlvf2").checked === true) ) //Linear
            {
                dset("settingsZoom", true);

                var zoom = parseInt(document.getElementById("zoom").value);
                zoom *= 10;
                document.getElementById("zoomtext").innerHTML = zoom+"%";
                if(zoom == 100) zoom = 99;

                cmd = cmd + zoom; //fov
            }
        }
    }
    else
    {
        var eis_set = "";
        var fov_set = "";
        eis_set = dcmd(eis_set,"eis");
        fov_set = dcmd(fov_set,"f");

        if(eis_set.length > 0 && fov_set.length > 0)
        {
            cmd = dcmd(cmd,"eis"); //eis
            cmd = cmd + "!N"; // delay
            cmd = dcmd(cmd,"f"); //fov
        }
        else
        {
            cmd = dcmd(cmd,"eis"); //eis
            cmd = dcmd(cmd,"f"); //fov
        }

        if(	(document.getElementById("f1").checked === true) || //Wide
            (document.getElementById("f3").checked === true)/* || //Linear
            (document.getElementById("f5").checked === true)*/ ) //Linear+HL
        {
            dset("settingsZoom", true);

            var zoom = parseInt(document.getElementById("zoom").value);
            zoom *= 10;
            document.getElementById("zoomtext").innerHTML = zoom+"%";
            if(zoom == 100) zoom = 99;

            cmd = cmd + zoom; //fov
        }
        else
        {
            dset("settingsZoom", false);
        }
    }

    if(checkedmode >= 19 && checkedmode <= 24) //RAW Photo modes
        cmd = dcmd(cmd,"raw"); //raw photo control

    if(document.getElementById("sm") !== null)
    {
        if(document.getElementById("sm").checked === true)
        {
            if(document.getElementById("smd").checked === true)
            {
                cmd = cmd + "oSM0";
            }
            else if(document.getElementById("sl").checked === true)
            {
                cmd = dcmd(cmd,"sl") + spot_x + "," + spot_y; //spot Lock
            }
            else
            {
                cmd = dcmd(cmd,"sm") + spot_x + "," + spot_y; //spotMeter
            }
        }
    }

    if(document.getElementById("pt").checked === true)
    {
        if(document.getElementById("ptr").checked === true)
        {
            cmd = cmd + "t0"; //protune reset
        }
        else
        {
            cmd = cmd + "t"; //protune
        }
    }

    cmd = dcmd(cmd,"hind"); //hindsight
    cmd = dcmd(cmd,"dur"); //duration
    cmd = dcmd(cmd,"all"); //auto low light
    cmd = dcmd(cmd,"audt"); //audio control


    const fps = document.querySelector('input[name="fps"]:checked')?.value;
    timecodefps = Number(fps?.slice(1)) || 30;

    if(document.getElementById("pt") !== null)
    {
        if(document.getElementById("pt").checked === true && document.getElementById("ptr").checked === false)
        {
            cmd = dcmd(cmd,"ptc"); //color
            cmd = dcmd(cmd,"ptd"); //depth
            cmd = dcmd(cmd,"br"); //bitrate
            cmd = dcmd(cmd,"wb"); //wb

            if(document.getElementById('iso8').checked === false)
            {
                cmd = dcmd(cmd,"iso"); //iso max
                if(document.getElementById('isomin8').checked === false)
                {
                    let isomin = dcmd("","isomin"); //min
                    let isomax = dcmd("","iso");    //max

                    var min = parseInt(isomin.substring(1));
                    var max = parseInt(isomax.substring(1));

                    if(max < min)
                    {
                        if(max == 1) document.getElementById('isomin1').checked = true;
                        if(max == 2) document.getElementById('isomin2').checked = true;
                        if(max == 4) document.getElementById('isomin3').checked = true;
                        if(max == 8) document.getElementById('isomin4').checked = true;
                        if(max == 16) document.getElementById('isomin5').checked = true;
                        if(max == 32) document.getElementById('isomin6').checked = true;
                        cmd = cmd + "M" + max;    //set the min to match the max iso
                    }
                    else
                        cmd = dcmd(cmd,"isomin"); //add iso min

                    if(document.getElementById('shut7').checked === false)
                    {
                        //cmd = dcmd(cmd,"iso"); //iso max
                        cmd = dcmd(cmd,"shut"); //shutter angle
                    }
                }
                else if(document.getElementById('shut7').checked === false)
                {
                    cmd = dcmd(cmd,"shut"); //shutter angle
                }
            }
            else if(document.getElementById('isomin8').checked === false)
            {
                cmd = cmd + "i64"; //ADD fake ISO max
                cmd = dcmd(cmd,"isomin");//iso min
                if(document.getElementById('shut7').checked === false)
                {
                    cmd = cmd + "i64"; //ADD fake max
                    cmd = dcmd(cmd,"shut"); //shutter angle
                }
            }
            else if(document.getElementById('shut7').checked === false)
            {
                cmd = cmd + "i64"; //ADD fake ISO max
                cmd = dcmd(cmd,"shut"); //shutter angle
            }

            cmd = dcmd(cmd,"ev"); //ev
            cmd = dcmd(cmd,"sharp"); //sharp
            cmd = dcmd(cmd,"aud"); //audio control
            cmd = dcmd(cmd,"bit"); //bitrate control
        }
    }



    if(document.getElementById("options") !== null)
    {
        if(document.getElementById("options").checked === true)
        {
            var opt = "";
            var addO = "o";
            cmd = dcmd(cmd,"gps");
            cmd = dcmd(cmd,"vc");
            cmd = dcmd(cmd,"qc");
            cmd = dcmd(cmd,"dm");

            opt = dcmd(addO, "bv"); if(opt != "o") { cmd = cmd + opt; addO = ""; }
            opt = dcmd(addO, "db"); if(opt != "o") { cmd = cmd + opt; addO = ""; }
            opt = dcmd(addO, "lo"); if(opt != "o") { cmd = cmd + opt; addO = ""; }
            opt = dcmd(addO, "or"); if(opt != "o") { cmd = cmd + opt; addO = ""; }
            opt = dcmd(addO, "ao"); if(opt != "o") { cmd = cmd + opt; addO = ""; }
            opt = dcmd(addO, "so"); if(opt != "o") { cmd = cmd + opt; addO = ""; }
            opt = dcmd(addO, "wc"); if(opt != "o") { cmd = cmd + opt; addO = ""; }
            opt = dcmd(addO, "ln"); if(opt != "o") { cmd = cmd + opt; addO = ""; }
        }
    }


    if(document.getElementById("actions") !== null)
    {
        if(document.getElementById("actions").checked === true)
        {

        }
        else
        {
            dset("opDT", true);
        }
    }

    var dt = document.getElementById("dt").checked;

    today = new Date();

    if(cmd != lastcmd)
    {
        ms = today.getTime();
        changed = true;
        lastcmd = cmd;
    }

    if(dt === true)
    {
        dset("opDTS", true);
        dset("copyshow", false);   // don't what user printing or sharing code with wrong date and time

        var frms;
        var secs = true;//document.getElementById("dtsec").checked;
        var timecode = document.getElementById("dttimecode").checked;

        yy = today.getFullYear() - 2000;
        mm = today.getMonth() + 1;
        dd = today.getDate();
        h = today.getHours();
        m = today.getMinutes();
        s = today.getSeconds();
        ms = today.getMilliseconds();


        frms = (h * 3600 + m * 60 + s) * timecodefps + Math.floor((timecodefps * ms) / 1000);

        yy = padTime(yy);
        mm = padTime(mm);
        dd = padTime(dd);
        h = padTime(h);
        m = padTime(m);
        s = padTime(s);
        //ms = Math.floor(ms / 10); // hundredths
        ms = padTime1000(ms);

        //var curr = today.getTime();

        cmd = cmd + "oT" + yy + mm + dd + h + m;
        if(secs || timecode)
        {
            cmd = cmd + s;
            if(timecode)
            {
                cmd = cmd + "." + ms + "oTI" + id;
            }
        }

        timechecked = true;
    }
    else
    {
        dset("opDTS", false);
        dset("copyshow", true);

        if(timechecked === true)
        {
            ms = today.getTime();
            changed = true;
        }
        timenotchecked = false;
    }


    var actions = document.getElementById("actions").checked;
    if(actions === true)
    {
        var S_added = 0;
        var SM_added = 0;
        var SK_added = 0;
        if(document.getElementById("starthrs") !== null && document.getElementById("startmins") !== null && document.getElementById("time") !== null)
        {
            var newcmd = "";
            var secs = 0;
            var starttime = document.getElementById("time").value;
            secs = Number(3600 * document.getElementById("starthrs").value) + Number(60 * document.getElementById("startmins").value) + Number(document.getElementById("startsecs").value);
            var risemins = 60 * document.getElementById("risemins").value;
            var setmins = 60 * document.getElementById("setmins").value;
            if(setmins !== 0)
            {
                newcmd = "!s" + setmins + "N" + cmd + "!S";
                cmd = newcmd;
                S_added = 1;
            }
            else if(risemins !== 0)
            {
                newcmd = "!r" + risemins + "N" + cmd + "!S";
                cmd = newcmd;
                S_added = 1;
            }
            else if(secs > 0)
            {
                if(secs < 20)
                {
                    newcmd = cmd + "!" + secs + "S";
                    cmd = newcmd;
                    S_added = 1;
                }
                else
                {
                    newcmd = "!" + secs + "N" + cmd + "!S";
                    cmd = newcmd;
                    S_added = 1;
                }
            }
            else if(starttime.length == 5)
            {
                newcmd = "!" + starttime + "N" + cmd + "!S";
                cmd = newcmd;
                S_added = 1;
            }
        }

        if(document.getElementById("mstart") !== null)
        {
            var mstart = document.getElementById("mstart").value;
            if(mstart > 0)
            {
                if(S_added)
                {
                    cmd = cmd + "M" + mstart;
                    SM_added = 1;
                }
                else
                {
                    cmd = cmd + "!SM" + mstart;
                    SM_added = 1;
                }
            }

            if(document.getElementById("mend") !== null)
            {
                var mend = document.getElementById("mend").value;
                if(mend > 0 && SM_added)
                {
                    cmd = cmd + "-" + mend;
                }
            }

            if(document.getElementById("dhold") !== null)
            {
                var dhold = document.getElementById("dhold").value;
                if(dhold > 0 && SM_added)
                {
                    cmd = cmd + "D" + dhold;
                }
            }
            if(document.getElementById("mmhold") !== null)
            {
                var mmhold = document.getElementById("mmhold").value;
                if(mmhold > 0 && SM_added)
                {
                    cmd = cmd + "M" + mmhold;
                }
            }
            if(document.getElementById("mhold") !== null)
            {
                var mhold = document.getElementById("mhold").value;
                if(mhold > 0 && SM_added)
                {
                    cmd = cmd + "H" + mhold;
                }
            }
        }


        if(document.getElementById("vstart") !== null)
        {
            var vstart = document.getElementById("vstart").value;
            if(vstart > 0)
            {
                if(S_added)
                {
                    cmd = cmd + "K" + vstart;
                    SK_added = 1;
                }
                else
                {
                    cmd = cmd + "!SK" + vstart;
                    SK_added = 1;
                }
            }

            if(document.getElementById("vend") !== null)
            {
                var vend = document.getElementById("vend").value;
                if(vend > 0 && SK_added)
                {
                    cmd = cmd + "-" + vend;
                }
            }
            if(document.getElementById("vhold") !== null)
            {
                var vhold = document.getElementById("vhold").value;
                if(vhold > 0 && SK_added)
                {
                    cmd = cmd + "H" + vhold;
                }
            }
        }



        if(document.getElementById("endhrs") !== null && document.getElementById("endmins") !== null && document.getElementById("endsecs") !== null && document.getElementById("time") !== null)
        {
            var secs = 0;
            var endtime = document.getElementById("endtime").value;
            //var endrisemins = 60 * document.getElementById("endrisemins").value;
            //var endsetmins = 60 * document.getElementById("endsetmins").value;
            secs = Number(60 * 60 * document.getElementById("endhrs").value) + Number(60 * document.getElementById("endmins").value) + Number(document.getElementById("endsecs").value);
            /*if(endsetmins != 0)
            {
                cmd = cmd + "!s" + endsetmins + "E";
            }
            else if(endrisemins != 0)
            {
                cmd = cmd + "!r" + endrisemins + "E";
            }
            else*/
            if(secs > 0)
            {
                cmd = cmd + "!" + secs + "E";
            }
            else if(endtime.length == 5)
            {
                cmd = cmd + "!" + endtime + "E";
            }
        }

        if(document.getElementById("repeat").checked === true)
        {
            cmd = cmd + "!" + "R";
        }

        /*
        if(document.getElementById("repeathrs") !== null && document.getElementById("repeatmins") !== null && document.getElementById("repeatsecs") !== null && document.getElementById("time") !== null)
        {
            var secs = 0;
            var repeattime = document.getElementById("repeattime").value;
            var repeatrisemins = 60 * document.getElementById("repeatrisemins").value;
            var repeatsetmins = 60 * document.getElementById("repeatsetmins").value;
            secs = Number(60 * 60 * document.getElementById("repeathrs").value) + Number(60 * document.getElementById("repeatmins").value) + Number(document.getElementById("repeatsecs").value);
            if(repeatsetmins !== 0)
            {
                cmd = cmd + "!s" + repeatsetmins + "R";
            }
            else if(repeatrisemins !== 0)
            {
                cmd = cmd + "!r" + repeatrisemins + "R";
            }
            else if(secs > 0)
            {
                cmd = cmd + "!" + secs + "R";
            }
            else if(repeattime.length == 5)
            {
                cmd = cmd + "!" + repeattime + "R";
            }
        }*/
    }

    if(document.getElementById("addcmd") !== null)
    {
        let unicodeInput = document.getElementById("addcmd").value;

        // Convert input string to an array of code points
        let codePoints = Array.from(unicodeInput);

        let asciiOutput = codePoints.map(cp => unicodeToAscii(cp.codePointAt(0))).join('');
        cmd = cmd + asciiOutput;
    }


    if(cmd != lasttimecmd)
    {
        changed = true;
    }

    var delay = 200;

    if(changed === true)
    {

        if(cmd === "") cmd = "\"QR Control\nReady\"";

        makeQR();

        even ++;
        {

            onCommand(cmd);
        }

        if(cmd != lasttimecmd)
        {

            clipcopy = "https://gopro.github.io/labs/control/set/?cmd=" + URLPrint(cmd);

            lasttimecmd = cmd;
        }

        lastms = today.getTime();
        changed = false;

        delay = 30;
        //console.log(cmd);
    }


}

function padTime(i) {
  if (i < 10) {i = "0" + i;}  // add zero in front of numbers < 10
  return i;
}
function padTime1000(i) {
  if (i >= 10 && i < 100) {i = "0" + i;}  // add zero in front of numbers < 100
  else if (i < 10) {i = "00" + i;}  // add zero in front of numbers < 10
  return i;
}

function dset(label, on) {
        var settings = document.getElementById(label);
        if (!settings) return;
        if(on === true)
        {
            if (settings.style.display === 'none')
                settings.style.display = 'block';
        }
        else
        {
            settings.style.display = 'none';
        }
}


function dcmd(cmd, id) {
    var x;
    if(document.getElementById(id) !== null)
    {
        x = document.getElementById(id).checked;
        if( x === true)
            cmd = cmd + document.getElementById(id).value;
    }
    else
    {
        for (i = 1; i < 40; i++) {
            var newid = id+i;
            if(document.getElementById(newid) !== null)
            {
                x = document.getElementById(newid).checked;
                if( x === true)
                    cmd = cmd + document.getElementById(newid).value;
            }
        }
    }
    return cmd;
}



return {
  refresh: startTime,
  snapshot() {
    return { fields: Object.fromEntries([...document.querySelectorAll('#camera-controls input')].map(input => [input.id,
      input.type === 'radio' || input.type === 'checkbox' ? input.checked : input.value])),
      icon: last_icon_num, spot: [spot_x, spot_y] };
  },
  restore(state) {
    if (!state?.fields) return;
    for (const input of document.querySelectorAll('#camera-controls input')) {
      if (!(input.id in state.fields)) continue;
      if (input.type === 'radio' || input.type === 'checkbox') input.checked = state.fields[input.id] === true;
      else input.value = String(state.fields[input.id]);
    }
    icon_num = last_icon_num = Number.isInteger(state.icon) ? Math.max(-1, Math.min(32, state.icon)) : 0;
    if (Array.isArray(state.spot)) [spot_x, spot_y] = state.spot.map(x => Math.max(10, Math.min(90, Number(x) || 50)));
  }
};
}
