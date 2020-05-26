using System.Collections.Generic;

using Audible.Interfaces.Provider;

namespace Audible.Interfaces.Model
{
    public interface INoteModel
    {
        IEnumerable<Note> Notes { get; }
        Note GetNoteFromName(string noteName);
        NoteType NoteType { get; }
        Note Blank { get; }

        void SetNoteType(NoteType type);
    }
}