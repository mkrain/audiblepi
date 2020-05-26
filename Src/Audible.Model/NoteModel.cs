using System;
using System.Collections.Generic;

using Audible.Interfaces.Messages.Settings;
using Audible.Interfaces.Model;
using Audible.Interfaces.Provider;

using GalaSoft.MvvmLight.Messaging;

namespace Audible.Model
{
    public class NoteModel : INoteModel
    {
        private readonly INoteProvider _provider;

        public IEnumerable<Note> Notes 
        { 
            get
            {
                return
                    new List<Note>
                    {
                        _provider.PianoNoteA,
                        _provider.PianoNoteASharp,
                        _provider.PianoNoteB,
                        _provider.PianoNoteC,
                        _provider.PianoNoteCSharp,
                        _provider.PianoNoteD,
                        _provider.PianoNoteDSharp,
                        _provider.PianoNoteE,
                        _provider.PianoNoteF,
                        _provider.PianoNoteFSharp,
                        _provider.PianoNoteG,
                        _provider.PianoNoteGSharp
                    };
            }
        }

        public NoteType NoteType
        {
            get { return _provider.SelectedNoteType; }
        }

        public Note Blank
        {
            get { return _provider.Blank; }
        }

        public NoteModel(INoteProvider provider)
        {
            if( provider == null )
                throw new ArgumentNullException("provider");

            _provider = provider;
    
            Messenger.Default.Register<NoteTypeChangedMessage>(
                this,
                m => this.SetNoteType(m.Data));
        }

        public void SetNoteType(NoteType type)
        {
            _provider.SetNoteType(type);
        }

        public Note GetNoteFromName(string noteName)
        {
            if( string.IsNullOrEmpty(noteName) )
                return _provider.Blank;

            switch( noteName )
            {
                case "0":
                    return _provider.PianoNoteC;
                case "1":
                    return _provider.PianoNoteCSharp;
                case "2":
                    return _provider.PianoNoteD;
                case "3":
                    return _provider.PianoNoteDSharp;
                case "4":
                    return _provider.PianoNoteE;
                case "5":
                    return _provider.PianoNoteF;
                case "6":
                    return _provider.PianoNoteFSharp;
                case "7":
                    return _provider.PianoNoteG;
                case "8":
                    return _provider.PianoNoteGSharp;
                case "9":
                    return _provider.PianoNoteA;
                case "A":
                    return _provider.PianoNoteASharp;
                case "B":
                    return _provider.PianoNoteB;
                default:
                    throw new ArgumentException("Invalid note name: " + noteName);
            }
        }
    }
}