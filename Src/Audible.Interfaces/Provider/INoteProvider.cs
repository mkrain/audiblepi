
using System.Collections.Generic;

namespace Audible.Interfaces.Provider
{
    public interface INoteProvider
    {
        Note PianoNoteA { get; }
        Note PianoNoteB { get; }
        Note PianoNoteC { get; }
        Note PianoNoteD { get; }
        Note PianoNoteE { get; }
        Note PianoNoteF { get; }
        Note PianoNoteG { get; }
        Note PianoNoteASharp { get; }
        Note PianoNoteCSharp { get; }
        Note PianoNoteDSharp { get; }
        Note PianoNoteFSharp { get; }
        Note PianoNoteGSharp { get; }
        Note Blank { get; }

        IEnumerable<NoteType> NoteTypes { get; }

        NoteType SelectedNoteType { get; }

        void SetNoteType(NoteType type);
    }

    //public enum SelectedNoteType
    //{
    //    None = 0,
    //    Random,
    //    Glockenspiel,
    //    Guitar,
    //    Piano,
    //    Sax,
    //    Violin
    //}
}