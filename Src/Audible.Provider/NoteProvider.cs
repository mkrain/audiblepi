using System.Collections.Generic;
using System.Globalization;
using System.Linq;

using Audible.Interfaces.Provider;

namespace Audible.Provider
{
    public class NoteProvider : INoteProvider
    {
        //private const string MP3_EXTENSTION = "mp3";
        //private const string WAV_EXTENSTION = "wav";

        //Whole Notes
        private readonly string _painoNoteA = "a.wav";
        private readonly string _painoNoteB = "b.wav";
        private readonly string _painoNoteC = "c.wav";
        private readonly string _painoNoteD = "d.wav";
        private readonly string _painoNoteE = "e.wav";
        private readonly string _painoNoteF = "f.wav";
        private readonly string _painoNoteG = "g.wav";

        //Half notes, semitones
        private readonly string _painoNoteASharp = "a#.wav";
        private readonly string _painoNoteCSharp = "c#.wav";
        private readonly string _painoNoteDSharp = "d#.wav";
        private readonly string _painoNoteFSharp = "f#.wav";
        private readonly string _painoNoteGSharp = "g#.wav";

        private readonly string _noteUri = "Notes";
        private readonly string _noteUriFormatString = "{0}/{1}/{2}";
        private static NoteType _selectedNoteType;

        private static readonly Note _blank = new Note {Id = string.Empty, Name = string.Empty};
        //private static readonly Random _random = new Random();

        private static readonly IEnumerable<NoteType> _noteTypes;
        //private static readonly int _count;

        public Note Blank
        {
            get { return _blank; }
        }

        public Note PianoNoteA
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteA, "A", 9);
            }
        }

        public Note PianoNoteB
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteB, "B", 11);
            }
        }

        public Note PianoNoteC
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteC, "C", 0);
            }
        }

        public Note PianoNoteD
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteD, "D", 2);
            }
        }

        public Note PianoNoteE
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteE, "E", 4);
            }
        }

        public Note PianoNoteF
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteF, "F", 5);
            }
        }

        public Note PianoNoteG
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteG, "G", 7);
            }
        }


        public Note PianoNoteASharp
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteASharp, "A#", 10);
            }
        }

        public Note PianoNoteCSharp
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteCSharp, "C#", 1);
            }
        }

        public Note PianoNoteDSharp
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteDSharp, "D#", 3);
            }
        }

        public Note PianoNoteFSharp
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteFSharp, "F#", 6);
            }
        }

        public Note PianoNoteGSharp
        {
            get
            {
                return this.GetEmbeddedStream(_painoNoteGSharp, "G#", 8);
            }
        }

        public NoteType SelectedNoteType { get { return _selectedNoteType; } }

        public IEnumerable<NoteType> NoteTypes { get { return _noteTypes; } }

        static NoteProvider()
        {
            _noteTypes = 
                new List<NoteType>
                {
                    new NoteType { Id = 0, Name = "Glockenspiel", ImageUri = "/Images/Instruments/Xylophone.Icon.png" },
                    new NoteType { Id = 1, Name = "Guitar", ImageUri = "/Images/Instruments/Classical.Guitar.Icon.png" },
                    new NoteType { Id = 2, Name = "Piano", ImageUri = "/Images/Instruments/Piano.Icon.png" },
                    new NoteType { Id = 3, Name = "Sax", ImageUri = "/Images/Instruments/Sax.Icon.png" },
                    new NoteType { Id = 4, Name = "Violin", ImageUri = "/Images/Instruments/Violin.Icon.png" },
                };

            _selectedNoteType = _noteTypes.First();

            //_count = _noteTypes.Count();
        }


        public void SetNoteType(NoteType type)
        {
            _selectedNoteType = type;
        }

        private Note GetEmbeddedStream(string mp3Name, string noteName, int order)
        {
            var uriString = 
                string.Format(
                    _noteUriFormatString, 
                    _noteUri, 
                    //_selectedNoteType.Name == "Random" ? GetRandomNote().Name : _selectedNoteType.Name, 
                    _selectedNoteType.Name, 
                    mp3Name);

            return 
                new Note
                {
                    Id = order.ToString(CultureInfo.InvariantCulture),
                    Name = noteName,
                    Uri = uriString
                };
        }

        //private NoteType GetRandomNote()
        //{
        //    var random = _random.Next(0, _count);

        //    return _noteTypes.FirstOrDefault(n => n.Id == random);
        //}
    }
}