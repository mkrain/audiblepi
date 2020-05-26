using System.Collections.Generic;

using Audible.Interfaces.Provider;

namespace Audible.Interfaces.ViewModel
{
    public interface ISettingsViewmodel : IPageViewModel
    {
        IEnumerable<int> SkipDigits { get; }
        //IEnumerable<int> SupportedDigits { get; }
        IEnumerable<NoteType> NoteTypes { get; }

        int SelectedSkipDigit { get; set; }
        int SelectedNumberOfDigits { get; set; }

        NoteType SelectedNoteType { get; set; }
    }
}